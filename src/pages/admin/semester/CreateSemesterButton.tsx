// file: src/pages/admin/semester/CreateSemesterButton.tsx

import { useMemo, useState } from "react";
import Modal from "../../../components/Modal";
import type { Semester, SemesterCreateRequest } from "../../../lib/types/semester";
import { useCreateSemester } from "../hooks/semester";
import { isoDateToUnixEnd, isoDateToUnixStart } from "../../../lib/utils/functions.ts";

type Props = {
	onCreated?: (s: Semester) => void;
	className?: string;
};

type SemesterName = "Spring" | "Summer" | "Fall";

export default function CreateSemesterButton({ className = "" }: Props) {
	const [open, setOpen] = useState(false);

	const { create, saving, error, clearError } = useCreateSemester();

	const [name, setName] = useState<SemesterName>("Spring");
	const [year, setYear] = useState<string>(String(new Date().getFullYear()));
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [isCurrent, setIsCurrent] = useState<boolean>(false);

	const canSubmit = useMemo(() => {
		const y = year.trim();
		if (!y) return false;
		if (!/^\d+$/.test(y)) return false;
		if (!startDate || !endDate) return false;

		const start = isoDateToUnixStart(startDate);
		const end = isoDateToUnixEnd(endDate);
		return start <= end;
	}, [year, startDate, endDate]);

	function resetForm() {
		clearError();
		setName("Spring");
		setYear(String(new Date().getFullYear()));
		setStartDate("");
		setEndDate("");
		setIsCurrent(false);
	}

	async function onSubmit() {
		clearError();
		if (!canSubmit || saving) return;

		const payload: SemesterCreateRequest = {
			name,
			year: year.trim(),
			start: isoDateToUnixStart(startDate),
			end: isoDateToUnixEnd(endDate),
			isCurrent: isCurrent,
		};

		try {
			await create(payload);
			setOpen(false);
			resetForm();
		} catch {
			// error already set in hook
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => {
					clearError();
					setOpen(true);
				}}
				className={[
					"h-8 rounded-md border border-subtle bg-secondary text-on-secondary px-3 text-xs text-primary hover:bg-surface",
					className,
				].join(" ")}
			>
				Create semester
			</button>

			<Modal
				open={open}
				title="Create semester"
				onClose={() => {
					setOpen(false);
					clearError();
				}}
				className="w-[min(520px,95vw)]"
			>
				<div className="space-y-4">
					{error ? (
						<div className="rounded-md border border-subtle bg-surface-subtle p-3 text-sm text-primary">
							{error}
						</div>
					) : null}

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<label className="min-w-0">
							<div className="mb-1 text-xs font-medium text-primary">Semester</div>
							<select
								value={name}
								onChange={(e) => setName(e.target.value as SemesterName)}
								className="h-9 w-full rounded-md border border-subtle bg-surface-subtle px-2 text-sm text-primary"
							>
								<option value="Spring">Spring</option>
								<option value="Summer">Summer</option>
								<option value="Fall">Fall</option>
							</select>
						</label>

						<label className="min-w-0">
							<div className="mb-1 text-xs font-medium text-primary">Year</div>
							<input
								value={year}
								onChange={(e) => setYear(e.target.value)}
								inputMode="numeric"
								placeholder="2026"
								className="h-9 w-full rounded-md border border-subtle bg-surface-subtle px-2 text-sm text-primary"
							/>
						</label>

						<label className="min-w-0">
							<div className="mb-1 text-xs font-medium text-primary">Start date</div>
							<input
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className="h-9 w-full rounded-md border border-subtle bg-surface-subtle px-2 text-sm text-primary"
							/>
						</label>

						<label className="min-w-0">
							<div className="mb-1 text-xs font-medium text-primary">End date</div>
							<input
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className="h-9 w-full rounded-md border border-subtle bg-surface-subtle px-2 text-sm text-primary"
							/>
						</label>
					</div>

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={isCurrent}
							onChange={(e) => setIsCurrent(e.target.checked)}
							className="h-4 w-4"
						/>
						<span className="text-sm text-primary">Mark as current semester</span>
					</label>

					<div className="flex items-center justify-end gap-2 pt-2">
						<button
							type="button"
							disabled={!canSubmit || saving}
							onClick={onSubmit}
							className={[
								"h-9 rounded-md border border-subtle px-3 text-sm",
								!canSubmit || saving
									? "bg-accent text-on-accent cursor-not-allowed"
									: "bg-accent text-on-accent hover:bg-surface-subtle",
							].join(" ")}
						>
							{saving ? "Creating..." : "Create"}
						</button>
					</div>

					<div className="text-[11px] text-muted">
						Dates are saved as US-Eastern with Daylight Saving: start at 12:00 AM, end
						at 11:59 PM.
					</div>
				</div>
			</Modal>
		</>
	);
}
