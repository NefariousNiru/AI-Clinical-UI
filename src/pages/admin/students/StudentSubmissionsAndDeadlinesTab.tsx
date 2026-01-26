// file: src/pages/admin/students/StudentSubmissionsAndDeadlinesTab.tsx

import type { Semester } from "../../../lib/types/semester.ts";
import { WeeklyWorkupDropdown } from "./WeeklyWorkupDropdown.tsx";
import type { SubmissionView } from "../../../lib/types/studentDeadlines.ts";
import { useSubmissionDeadlines, useViewSubmissionModal } from "../hooks/submissionAndDeadlines.ts";
import {
	ActionChip,
	btnSecondary,
	InlineNotice,
	SemesterModeBadge,
} from "../../shared/SharedUI.tsx";
import { ViewSubmissionModal } from "./ViewSubmissionModal.tsx";
import { WorkupStatusPill } from "../../shared/WorkupStatusPill.tsx";

type Props = {
	semester: Semester | null;
};

const tableGrid = "grid grid-cols-[1.6fr_200px_140px_260px] gap-3";

function TableHeader() {
	return (
		<div
			className={[
				tableGrid,
				"px-4 py-2 text-[11px] font-semibold bg-accent text-on-accent",
			].join(" ")}
			role="row"
		>
			<div>Student</div>
			<div>Status</div>
			<div>Comments</div>
			<div className="text-right pr-1">Actions</div>
		</div>
	);
}

function Row({
	item,
	actionsDisabled,
	onView,
}: {
	item: SubmissionView;
	actionsDisabled: boolean;
	onView: () => void;
}) {
	const canView = item.status === "grading" || item.status === "feedback_available";
	const canExtend = item.status === "not_submitted"; // extend later with week end < now

	return (
		<div className={[tableGrid, "px-4 py-3 items-center row-item"].join(" ")} role="row">
			<div className="min-w-0">
				<div className="text-xs font-medium text-primary">{item.name}</div>
			</div>

			<div className="flex items-center gap-2">
				<WorkupStatusPill status={item.status} />
			</div>

			<div className="text-xs text-muted">
				{item.isCommented ? <span className="font-semibold text-primary">Yes</span> : "No"}
			</div>

			<div className="flex justify-end">
				<div className="flex flex-wrap gap-2 justify-end">
					{canView ? (
						<ActionChip
							label="View"
							mobileLabel="View"
							onClick={onView}
							disabled={actionsDisabled}
							ariaLabel={`View submission for ${item.name}`}
							title="Available only after deadline (Grading / Feedback available)."
						/>
					) : canExtend ? (
						<ActionChip
							label="Extend"
							mobileLabel="Extend"
							onClick={() => {}}
							disabled
							ariaLabel={`Extend deadline for ${item.name}`}
							title="Extend will be enabled after the deadline passes."
						/>
					) : (
						<span
							className="rounded-full px-3 py-2 text-[11px] font-semibold border bg-surface-subtle text-muted border-subtle"
							title={
								item.status === "submitted" || item.status === "in_progress"
									? "Student is actively working; viewing disabled."
									: "No actions available for this status."
							}
						>
							No actions
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export function StudentSubmissionsAndDeadlinesTab({ semester }: Props) {
	const s = useSubmissionDeadlines(semester);
	const view = useViewSubmissionModal();

	return (
		<div className="space-y-4 app-bg">
			<section className="rounded-[1.75rem] bg-input shadow-sm border border-subtle p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h2 className="text-sm font-semibold text-primary">
							Submissions and Deadlines
						</h2>
						<p className="text-xs text-muted mt-1">
							View submissions for{" "}
							<span className="font-semibold text-primary">{s.summaryText}</span>
						</p>
					</div>

					<SemesterModeBadge semester={semester} />
				</div>

				<div className="mt-3 grid grid-cols-1 lg:grid-cols-1 gap-4 items-stretch">
					<div className="min-w-0 flex flex-col h-full">
						<WeeklyWorkupDropdown
							semesterId={semester?.id ?? null}
							value={s.weeklyWorkupId}
							onChange={s.setWeek}
							limit={s.limit}
							onLimitChange={s.setLimit}
							disabled={!semester}
						/>

						<div className="mt-2 rounded-2xl bg-surface-subtle p-3 flex-1">
							{s.weekMeta ? (
								<p className="text-[11px] text-muted">
									<span className="font-semibold text-primary">Start:</span>{" "}
									{s.weekMeta.start}
									<span className="font-semibold text-primary pl-2">
										End:
									</span>{" "}
									{s.weekMeta.end}
								</p>
							) : (
								<p className="text-[11px] text-muted">
									Select a week to show its start/end dates and load submissions.
								</p>
							)}
						</div>

						<div>{s.error ? <InlineNotice tone="danger" text={s.error} /> : null}</div>
					</div>
				</div>
			</section>

			<section className="rounded-[1.75rem] bg-input shadow-sm border border-subtle">
				<div className="p-4 flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h2 className="text-sm font-semibold text-primary">Submissions</h2>
						<p className="text-xs text-muted mt-1">
							{!s.weeklyWorkupId
								? "Select a week to load submissions."
								: s.loading
									? "Loading submissions..."
									: s.items.length === 0
										? "No submissions found for this week."
										: `Showing ${s.items.length} results.`}
						</p>
					</div>

					<div className="flex items-center gap-2 shrink-0">
						<button
							type="button"
							className={[
								btnSecondary,
								"disabled:opacity-60 disabled:cursor-not-allowed",
							].join(" ")}
							disabled={!s.canPrev || s.loading}
							onClick={s.prevPage}
							aria-label="Previous page"
						>
							Prev
						</button>

						<button
							type="button"
							className={[
								btnSecondary,
								"disabled:opacity-60 disabled:cursor-not-allowed",
							].join(" ")}
							disabled={!s.canNext || s.loading}
							onClick={s.nextPage}
							aria-label="Next page"
						>
							Next
						</button>
					</div>
				</div>

				{s.loading ? (
					<div className="px-4 pb-4">
						<p className="text-xs text-muted">Loading...</p>
					</div>
				) : null}

				<div className="px-4 pb-4">
					{!s.weeklyWorkupId ? (
						<p className="mt-2 text-xs text-muted">Pick a week to view submissions.</p>
					) : s.items.length === 0 && !s.loading && !s.error ? (
						<p className="mt-2 text-xs text-muted">
							No submissions found for this week.
						</p>
					) : s.items.length > 0 ? (
						<div className="mt-3 overflow-x-auto" aria-label="Submissions table">
							<div className="min-w-[940px] rounded-2xl border border-subtle overflow-hidden">
								<TableHeader />
								{s.items.map((it) => (
									<Row
										key={`${it.enrollmentId}-${it.workupId}`}
										item={it}
										actionsDisabled={s.actionsDisabled}
										onView={() => view.openFor(it)}
									/>
								))}
							</div>
						</div>
					) : null}
				</div>
			</section>

			{view.target ? (
				<ViewSubmissionModal
					open={view.open}
					onClose={view.close}
					weeklyWorkupId={view.target.weeklyWorkupId}
					studentEnrollmentId={view.target.enrollmentId}
					status={view.target.status}
					studentName={view.target.name}
				/>
			) : null}
		</div>
	);
}
