// file: src/pages/student/forms/DRPForm.tsx

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import FormField from "./FormField";
import type { StudentDrpAnswer } from "../../../lib/types/studentSubmission.ts";
import { useDiseaseSearch } from "../hooks/diseaseSearch.ts";
import { titleizeDiseaseName } from "../../../lib/utils/functions.ts";
import { DRP_INFO_TEXT, HEALTH_CARE_PROBLEM_FIELDS } from "../hooks/constants.ts";

const FIELDS = HEALTH_CARE_PROBLEM_FIELDS.fields;

type Props = {
	title?: string;
	helpText?: string;
	items: StudentDrpAnswer[];
	onChange: (next: StudentDrpAnswer[]) => void;
};

function cx(...xs: Array<string | false | null | undefined>) {
	return xs.filter(Boolean).join(" ");
}

function makeEmptyDrp(): StudentDrpAnswer {
	return {
		name: "",
		isPriority: false,
		identification: "",
		explanation: "",
		planRecommendation: "",
		monitoring: "",
	};
}

function PriorityToggle({
	checked,
	disabled,
	helpText,
	onChange,
}: {
	checked: boolean;
	disabled?: boolean;
	helpText?: string;
	onChange: (next: boolean) => void;
}) {
	return (
		<div className="flex flex-col gap-1">
			<label
				className={cx("inline-flex items-center gap-2 text-sm", disabled && "opacity-60")}
			>
				<input
					type="checkbox"
					checked={checked}
					disabled={disabled}
					onChange={(e) => onChange(e.target.checked)}
					className={cx("h-4 w-4", disabled && "cursor-not-allowed")}
				/>
				<span className={cx("text-primary", disabled && "cursor-not-allowed")}>
					{FIELDS.isPriority.label}
				</span>
			</label>

			{disabled && helpText ? <div className="text-xs text-muted">{helpText}</div> : null}
		</div>
	);
}

function DiseaseAutocomplete({
	value,
	onChange,
	placeholder = "Search a disease...",
}: {
	value: string; // raw backend value
	onChange: (next: string) => void; // set raw backend value only on selection (or "" when cleared)
	placeholder?: string;
}) {
	const [open, setOpen] = useState(false);
	const [text, setText] = useState<string>(value ? titleizeDiseaseName(value) : "");
	const [touched, setTouched] = useState(false);

	const displayForValue = value ? titleizeDiseaseName(value) : "";

	useEffect(() => {
		if (!value) return;
		setText((cur) => (cur.trim().length === 0 ? displayForValue : cur));
	}, [value, displayForValue]);

	const { data, loading, error } = useDiseaseSearch(text);

	const showMenu = open && text.trim().length >= 3;

	const hasSelection = Boolean(value);
	const matchesSelection = hasSelection && text.trim() === displayForValue;
	const invalid = touched && !matchesSelection;

	return (
		<div className="relative">
			<input
				className={cx(
					"w-full rounded-lg border bg-surface-subtle px-3 py-2 text-sm text-primary",
					invalid ? "border-danger" : "border-subtle",
				)}
				value={text}
				placeholder={placeholder}
				onChange={(e) => {
					const nextText = e.target.value;
					setText(nextText);
					setOpen(true);
					if (value) onChange("");
				}}
				onFocus={() => setOpen(true)}
				onBlur={() => {
					setTouched(true);
					window.setTimeout(() => setOpen(false), 120);

					// If they had a valid selection but edited text, snap back to the selected display
					if (value && text.trim() !== displayForValue) {
						setText(displayForValue);
					}
				}}
				aria-autocomplete="list"
				aria-expanded={showMenu}
			/>

			{loading ? (
				<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
					<Loader2 size={16} className="animate-spin" aria-hidden="true" />
				</div>
			) : null}

			{showMenu ? (
				<div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-subtle bg-surface shadow-sm">
					{error ? <div className="px-3 py-2 text-sm text-danger">{error}</div> : null}

					{!error && data.length === 0 ? (
						<div className="px-3 py-2 text-sm text-muted">Disease not found</div>
					) : null}

					{data.map((name) => (
						<button
							key={name}
							type="button"
							className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-surface-subtle"
							onMouseDown={(e) => {
								e.preventDefault();
								onChange(name); // store raw backend value
								setText(titleizeDiseaseName(name)); // display titleized
								setTouched(true);
								setOpen(false);
							}}
						>
							{titleizeDiseaseName(name)}
						</button>
					))}
				</div>
			) : null}

			{invalid ? (
				<div className="mt-1 text-xs text-danger">
					Select a disease from the suggestions.
				</div>
			) : null}
		</div>
	);
}

export default function DRPForm({
	title = "Health Care Problems",
	helpText,
	items,
	onChange,
}: Props) {
	// Collapsed state is UI-only. Index-based is fine for now.
	const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

	// Unique problems in the list
	const [nameErrors, setNameErrors] = useState<Record<number, string | undefined>>({});

	const MAX_PROBLEMS = 15;
	const safeItems = useMemo(() => items ?? [], [items]);
	const atLimit = safeItems.length >= MAX_PROBLEMS;

	function setItem(idx: number, patch: Partial<StudentDrpAnswer>) {
		const next = safeItems.map((it, i) => (i === idx ? { ...it, ...patch } : it));
		onChange(next);
	}

	// Enforce unique disease name on selection
	function setProblemName(idx: number, nextName: string) {
		// clearing is always allowed
		if (!nextName) {
			setNameErrors((m) => ({ ...m, [idx]: undefined }));
			setItem(idx, { name: "" });
			return;
		}

		const normalized = nextName.trim().toLowerCase();
		const dupIdx = safeItems.findIndex(
			(it, i) => i !== idx && (it.name ?? "").trim().toLowerCase() === normalized,
		);

		if (dupIdx !== -1) {
			const existingRaw = safeItems[dupIdx]?.name ?? nextName;
			const existingLabel = titleizeDiseaseName(existingRaw);
			setNameErrors((m) => ({
				...m,
				[idx]: `"${existingLabel}" is already added. Each problem can be used only once.`,
			}));
			return; // do NOT commit duplicate selection
		}

		setNameErrors((m) => ({ ...m, [idx]: undefined }));
		setItem(idx, { name: nextName });
	}

	const priorityIdx = useMemo(
		() => safeItems.findIndex((x) => Boolean(x.isPriority)),
		[safeItems],
	);

	function setPriority(idx: number, nextChecked: boolean) {
		if (!nextChecked) {
			const next = safeItems.map((it, i) => (i === idx ? { ...it, isPriority: false } : it));
			onChange(next);
			return;
		}
		// Turning ON:
		// - allow if none set yet
		// - allow if already this one
		// - otherwise block
		if (priorityIdx === -1 || priorityIdx === idx) {
			const next = safeItems.map((it, i) => (i === idx ? { ...it, isPriority: true } : it));
			onChange(next);
			return;
		}
		return;
	}

	function toggleCollapsed(idx: number) {
		setCollapsed((m) => ({ ...m, [idx]: !(m[idx] ?? false) }));
	}

	function addProblem() {
		if (safeItems.length >= MAX_PROBLEMS) return;

		const next = [...safeItems, makeEmptyDrp()];
		onChange(next);

		// Expand the new card by default
		const idx = next.length - 1;
		setCollapsed((m) => ({ ...m, [idx]: false }));

		// Check duplicate problems
		setNameErrors((m) => ({ ...m, [idx]: undefined }));
	}

	function removeProblem(idx: number) {
		const next = safeItems.filter((_, i) => i !== idx);
		onChange(next);

		// reindex collapsed map
		setCollapsed((prev) => {
			const out: Record<number, boolean> = {};
			for (const [kStr, v] of Object.entries(prev)) {
				const k = Number(kStr);
				if (Number.isNaN(k)) continue;
				if (k < idx) out[k] = v;
				else if (k > idx) out[k - 1] = v;
			}
			return out;
		});

		// Reindex nameErrors map
		setNameErrors((prev) => {
			const out: Record<number, string | undefined> = {};
			for (const [kStr, v] of Object.entries(prev)) {
				const k = Number(kStr);
				if (Number.isNaN(k)) continue;
				if (k < idx) out[k] = v;
				else if (k > idx) out[k - 1] = v;
			}
			return out;
		});
	}

	const info = helpText ?? DRP_INFO_TEXT;

	return (
		<div className="flex flex-col gap-4">
			<div className="text-primary font-semibold">{title}</div>

			<div className="rounded-2xl border border-secondary bg-secondary-soft-alt p-4">
				<div className="text-sm font-medium text-secondary leading-relaxed">{info}</div>
			</div>

			{safeItems.length === 0 ? (
				<div className="rounded-2xl border border-subtle bg-surface-subtle px-4 py-3 text-sm text-muted">
					No problems added yet.
				</div>
			) : null}

			<div className="flex flex-col gap-3">
				{safeItems.map((it, idx) => {
					const isCollapsed = collapsed[idx] ?? false;
					const headerLabel = it.name
						? titleizeDiseaseName(it.name)
						: `Problem ${idx + 1}`;
					const isThisPriority = Boolean(it.isPriority);
					const priorityLocked = priorityIdx !== -1 && !isThisPriority;
					const nameError = nameErrors[idx];
					return (
						<div
							key={idx}
							className="rounded-2xl border border-subtle app-bg shadow-sm overflow-hidden"
						>
							{/* Card header */}
							<div className="flex items-center gap-3 p-5">
								<div className="min-w-0 flex-1">
									<div className="flex-1 flex items-center justify-between gap-2">
										<div className="text-sm font-medium text-primary truncate">
											{headerLabel}
										</div>
										<button
											type="button"
											onClick={() => toggleCollapsed(idx)}
											className="shrink-0 inline-flex items-center justify-center rounded-lg border border-subtle bg-surface-subtle px-2 py-2 text-primary"
											aria-label={
												isCollapsed ? "Expand problem" : "Collapse problem"
											}
										>
											{isCollapsed ? (
												<ChevronDown size={18} />
											) : (
												<ChevronUp size={18} />
											)}
										</button>
									</div>

									<div className="mt-5">
										<label className="block text-xs font-medium text-primary mb-1">
											{FIELDS.name.label}
										</label>

										<DiseaseAutocomplete
											value={it.name}
											onChange={(next) => setProblemName(idx, next)}
											placeholder={FIELDS.name.placeholder}
										/>

										{/* Duplicate error */}
										{nameError ? (
											<div className="mt-1 text-xs text-danger">
												{nameError}
											</div>
										) : null}
									</div>

									<div className="mt-3">
										<PriorityToggle
											checked={isThisPriority}
											disabled={priorityLocked}
											helpText={
												priorityLocked
													? "Only one problem can be marked as priority"
													: undefined
											}
											onChange={(next) => setPriority(idx, next)}
										/>
									</div>
								</div>
							</div>

							{/* Card body */}
							{isCollapsed ? null : (
								<div className="p-4 flex flex-col gap-4">
									<FormField
										label={FIELDS.identification.label}
										value={it.identification ?? ""}
										onChange={(v) =>
											setItem(idx, {
												identification: (v ?? "").trim() || undefined,
											})
										}
										limit={FIELDS.identification.limit}
										showCounter={FIELDS.identification.showCounter}
										multiline={FIELDS.identification.multiline}
									/>

									<FormField
										label={FIELDS.explanation.label}
										value={it.explanation ?? ""}
										onChange={(v) =>
											setItem(idx, {
												explanation: (v ?? "").trim() || undefined,
											})
										}
										limit={FIELDS.explanation.limit}
										showCounter={FIELDS.explanation.showCounter}
										multiline={FIELDS.explanation.multiline}
									/>

									<FormField
										label={FIELDS.planRecommendation.label}
										value={it.planRecommendation ?? ""}
										onChange={(v) =>
											setItem(idx, {
												planRecommendation: (v ?? "").trim() || undefined,
											})
										}
										limit={FIELDS.planRecommendation.limit}
										showCounter={FIELDS.planRecommendation.showCounter}
										multiline={FIELDS.planRecommendation.multiline}
									/>

									<FormField
										label={FIELDS.monitoring.label}
										value={it.monitoring ?? ""}
										onChange={(v) =>
											setItem(idx, {
												monitoring: (v ?? "").trim() || undefined,
											})
										}
										limit={FIELDS.monitoring.limit}
										showCounter={FIELDS.monitoring.showCounter}
										multiline={FIELDS.monitoring.multiline}
									/>

									<div className="mt-3 flex items-center justify-end">
										<button
											type="button"
											onClick={() => removeProblem(idx)}
											className={[
												"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm",
												"border-danger bg-danger-soft text-danger",
											].join(" ")}
											aria-label={`Delete problem ${idx + 1}`}
										>
											<Trash2 size={16} aria-hidden="true" />
											Delete
										</button>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={addProblem}
					disabled={atLimit}
					className={[
						"inline-flex items-center gap-2 rounded-lg border border-secondary bg-secondary text-on-secondary px-3 py-2 text-sm shadow-sm",
						atLimit ? "opacity-60 cursor-not-allowed" : "",
					].join(" ")}
					aria-label="Add a problem"
				>
					<Plus size={16} />
					Add a problem
				</button>

				{atLimit ? (
					<div className="text-xs text-muted">Max {MAX_PROBLEMS} problems reached</div>
				) : null}
			</div>
		</div>
	);
}
