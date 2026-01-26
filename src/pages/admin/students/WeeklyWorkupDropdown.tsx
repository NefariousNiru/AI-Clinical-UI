// file: src/pages/admin/students/WeeklyWorkupDropdown.tsx

import { useMemo } from "react";
import { useWeeklyWorkups } from "../hooks/weeks.ts";

export type WeeklyWorkupDropdownItem = {
	id: number;
	weekNo: number;
	patientFirstName: string;
	patientLastName: string;
	start: number; // unix seconds
	end: number; // unix seconds
};

type Props = {
	semesterId: number | null;
	value: number | null;
	onChange: (weeklyWorkupId: number | null, item: WeeklyWorkupDropdownItem | null) => void;

	limit: number;
	onLimitChange: (limit: number) => void;

	className?: string;
	disabled?: boolean;
};

function labelFor(w: WeeklyWorkupDropdownItem) {
	const first = (w.patientFirstName ?? "").trim();
	const last = (w.patientLastName ?? "").trim();
	const name = [first, last].filter(Boolean).join(" ");
	return `Week ${w.weekNo} - ${name || "Patient"}`;
}

export function WeeklyWorkupDropdown({
	semesterId,
	value,
	onChange,
	limit,
	onLimitChange,
	className,
	disabled,
}: Props) {
	const { weeks, loading, error } = useWeeklyWorkups(semesterId);

	const sorted = useMemo(() => {
		return [...(weeks as WeeklyWorkupDropdownItem[])].sort((a, b) => a.weekNo - b.weekNo);
	}, [weeks]);

	const isDisabled = disabled || !semesterId || loading;

	return (
		<div className={className}>
			<div className="flex items-center justify-between gap-3 mb-1">
				<label className="block text-xs font-medium text-muted">Weekly workup</label>

				<div className="flex items-center gap-2">
					<span className="text-[11px] text-muted">
						<span className="font-semibold text-primary">Limit:</span>
					</span>

					<select
						className="h-8 rounded-md border border-subtle bg-input px-2 text-xs text-primary"
						value={limit}
						onChange={(e) => onLimitChange(Number(e.target.value))}
						disabled={disabled || loading}
						aria-label="Results limit"
					>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
						<option value={150}>150</option>
					</select>
				</div>
			</div>

			<select
				className="h-8 w-full max-w-sm rounded-md border border-border bg-input px-3 text-sm text-primary outline-none disabled:opacity-60"
				value={value ?? ""}
				disabled={isDisabled}
				onChange={(e) => {
					const next = e.target.value ? Number(e.target.value) : null;
					const item = next == null ? null : (sorted.find((x) => x.id === next) ?? null);
					onChange(next, item);
				}}
			>
				<option value="">{loading ? "Loading..." : "Select a week"}</option>
				{sorted.map((w) => (
					<option key={w.id} value={w.id}>
						{labelFor(w)}
					</option>
				))}
			</select>

			{error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
		</div>
	);
}
