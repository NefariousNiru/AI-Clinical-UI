// file: src/pages/admin/students/ExtendDeadlineModal.tsx

import Modal from "../../../components/Modal.tsx";
import { EXTEND_REASONS, useExtendDeadlineModalForm } from "../hooks/submissionAndDeadlines.ts";

type Props = {
	open: boolean;
	onClose: () => void;

	weekId: number;
	enrollmentId: string;
	studentName: string;

	onExtended?: () => void | Promise<void>;
};

export function ExtendDeadlineModal({
	open,
	onClose,
	weekId,
	enrollmentId,
	studentName,
	onExtended,
}: Props) {
	const f = useExtendDeadlineModalForm({
		weekId,
		enrollmentId,
		onSuccess: onExtended,
		onClose,
	});

	return (
		<Modal
			open={open}
			onClose={f.saving ? undefined : onClose}
			title={`Extend deadline for ${studentName}`}
			className="w-[min(760px,95vw)]"
		>
			<div className="space-y-4">
				<p className="text-xs text-muted">Set a new deadline date with a reason</p>

				{f.error ? (
					<div className="rounded-xl border border-subtle bg-surface-subtle px-3 py-2">
						<p className="text-xs text-danger">{f.error}</p>
					</div>
				) : null}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-1">
						<label className="text-[11px] font-semibold text-primary">
							New Deadline Date
						</label>
						<input
							type="date"
							min={f.minDate}
							className="w-full rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary"
							value={f.dateStr}
							onChange={(e) => f.setDateStr(e.target.value)}
							disabled={f.saving}
						/>
						<p className="text-[11px] text-muted">Only future dates are allowed.</p>
					</div>

					<div className="space-y-1">
						<label className="text-[11px] font-semibold text-primary">Reason</label>
						<select
							className="w-full rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary"
							value={f.reasonKey}
							onChange={(e) =>
								f.setReasonKey(
									e.target.value as (typeof EXTEND_REASONS)[number]["value"],
								)
							}
							disabled={f.saving}
						>
							{EXTEND_REASONS.map((r) => (
								<option key={r.value} value={r.value}>
									{r.label}
								</option>
							))}
						</select>

						{f.isOther ? (
							<div className="mt-2 space-y-1">
								<label className="text-[11px] font-semibold text-primary">
									Specify reason
								</label>
								<textarea
									className="w-full min-h-[90px] rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary"
									placeholder="Enter a short, specific reason..."
									value={f.otherText}
									onChange={(e) => f.setOtherTextRaw(e.target.value)}
									disabled={f.saving}
									maxLength={100}
								/>
								<div className="flex justify-end">
									<p className="text-[11px] text-muted">
										{f.otherRemaining} left
									</p>
								</div>
							</div>
						) : null}
					</div>
				</div>

				<div className="flex items-center justify-end gap-2 pt-2">
					<button
						type="button"
						onClick={onClose}
						disabled={f.saving}
						className="h-9 rounded-xl border border-danger bg-danger-soft text-danger px-4 text-sm text-primary disabled:opacity-60"
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={f.submit}
						disabled={!f.canSubmit}
						className="h-9 rounded-xl border border-secondary bg-secondary text-on-secondary px-4 text-sm disabled:opacity-60"
						title={
							!f.canSubmit
								? "Pick a future date and provide a valid reason."
								: "Extend deadline"
						}
					>
						{f.saving ? "Saving..." : "Extend deadline"}
					</button>
				</div>
			</div>
		</Modal>
	);
}
