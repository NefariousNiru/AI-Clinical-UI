// file: src/pages/admin/students/StudentSubmissionsAndDeadlinesTab.tsx

import type { Semester } from "../../../lib/types/semester.ts";
import type { WeeklyWorkupStudentStatus } from "../../../lib/types/studentWeeks.ts";
import { STATUS_UI } from "../../../lib/constants/ui.ts";
import { WeeklyWorkupDropdown } from "./WeeklyWorkupDropdown.tsx";
import type { SubmissionView } from "../../../lib/types/studentDeadlines.ts";
import { titleizeCase } from "../../../lib/utils/functions.ts";
import { useSubmissionDeadlines } from "../hooks/submissionAndDeadlines.ts";
import { ActionChip, btnSecondary, InlineNotice, SemesterModeBadge } from "./SharedUI.tsx";

type Props = {
	semester: Semester | null;
};

function StatusPill({ status }: { status: WeeklyWorkupStudentStatus }) {
	const cfg = STATUS_UI[status];
	return (
		<span
			className={[
				"inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold border leading-none",
				cfg.pill,
				"border border-subtle",
			].join(" ")}
			title={titleizeCase(status)}
		>
			{titleizeCase(status)}
		</span>
	);
}

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
	onActions,
}: {
	item: SubmissionView;
	actionsDisabled: boolean;
	onActions: () => void;
}) {
	return (
		<div className={[tableGrid, "px-4 py-3 items-center row-item"].join(" ")} role="row">
			<div className="min-w-0">
				<div className="text-xs font-medium text-primary">{item.name}</div>
			</div>

			<div className="flex items-center gap-2">
				<StatusPill status={item.status as WeeklyWorkupStudentStatus} />
			</div>

			<div className="text-xs text-muted">
				{item.isCommented ? <span className="font-semibold text-primary">Yes</span> : "No"}
			</div>

			<div className="flex justify-end">
				<div className="flex flex-wrap gap-2 justify-end">
					<ActionChip
						label="Actions"
						mobileLabel="Actions"
						onClick={onActions}
						disabled={actionsDisabled}
						ariaLabel={`Open actions for ${item.name}`}
					/>
				</div>
			</div>
		</div>
	);
}

export function StudentSubmissionsAndDeadlinesTab({ semester }: Props) {
	const s = useSubmissionDeadlines(semester);

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
										onActions={() => {
											console.log(
												"TODO actions for",
												it.enrollmentId,
												it.workupId,
											);
										}}
									/>
								))}
							</div>
						</div>
					) : null}
				</div>
			</section>
		</div>
	);
}
