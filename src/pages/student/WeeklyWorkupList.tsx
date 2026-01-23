// file: src/pages/student/WeeklyWorkupList.tsx

import { useMemo } from "react";
import { Calendar, Clock } from "lucide-react";
import { useStudentWeeks } from "./hooks/studentWeeks";
import type { WeeklyWorkupStudent, WeeklyWorkupStudentStatus } from "../../lib/types/studentWeeks";
import { titleizeCase, unixToIsoDate } from "../../lib/utils/functions";
import { useNavigate } from "react-router-dom";
import { COURSE, STATUS_HELP } from "./hooks/constants.ts";
import { STUDENT_WORKUP } from "../../routes.ts";
import { STATUS_UI, type StatusCfg } from "../../lib/constants/ui.ts";

function uiConfig(status: WeeklyWorkupStudentStatus): StatusCfg {
	return STATUS_UI[status];
}

function isWorkupDisabled(status: WeeklyWorkupStudentStatus): boolean {
	return status === "locked" || status === "not_submitted";
}

function cx(...xs: Array<string | false | null | undefined>) {
	return xs.filter(Boolean).join(" ");
}

function StatusPill({ status }: { status: WeeklyWorkupStudent["status"] }) {
	return (
		<span
			className={cx(
				"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
				uiConfig(status).pill,
			)}
			aria-label={`Status: ${titleizeCase(status)}`}
		>
			{titleizeCase(status)}
		</span>
	);
}

function DateItem({
	icon,
	label,
	ariaLabel,
}: {
	icon: "start" | "end";
	label: string;
	ariaLabel: string;
}) {
	const Icon = icon === "start" ? Calendar : Clock;
	return (
		<div className="flex items-center gap-2">
			<Icon className="h-4 w-4" aria-hidden="true" />
			<span className="whitespace-nowrap tabular-nums">{label}</span>
			<span className="sr-only">{ariaLabel}</span>
		</div>
	);
}

function WorkupDates({ start, end }: { start: number; end: number }) {
	const startLabel = unixToIsoDate(start);
	const endLabel = unixToIsoDate(end);
	return (
		<div className="flex items-center gap-4 text-xs text-muted">
			<DateItem icon="start" label={startLabel} ariaLabel={`Start: ${startLabel}`} />
			<DateItem icon="end" label={endLabel} ariaLabel={`End: ${endLabel}`} />
		</div>
	);
}

function StatusHelpPanel() {
	return (
		<aside
			className="rounded-3xl border border-subtle app-bg p-5"
			aria-label="Workup status help"
		>
			<div className="text-sm font-semibold text-primary">Status Guide</div>

			<div className="mt-4 flex flex-wrap gap-8">
				{STATUS_HELP.map((it) => (
					<div key={it.status} className="flex items-start gap-3">
						<span
							className={cx(
								"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
								uiConfig(it.status).pill,
							)}
						>
							{it.label}
						</span>

						<div className="text-xs text-muted leading-relaxed">{it.msg}</div>
					</div>
				))}
			</div>
		</aside>
	);
}

function routeToWorkup(
	nav: ReturnType<typeof useNavigate>,
	args: {
		status: WeeklyWorkupStudentStatus;
		id: number;
		enrollmentId: string;
		weekNo: number;
		patientName: string;
	},
) {
	const { status, id, enrollmentId, weekNo, patientName } = args;

	if (isWorkupDisabled(status)) return;

	nav(STUDENT_WORKUP, {
		state: {
			weeklyWorkupId: id,
			studentEnrollmentId: enrollmentId,
			weekNo: weekNo,
			patientName: patientName,
			status: status,
		},
	});
}

function WorkupActions({
	weekNo,
	id,
	enrollmentId,
	status,
	patientName,
}: {
	weekNo: number;
	id: number;
	enrollmentId: string; // UUID
	status: WeeklyWorkupStudentStatus;
	patientName: string;
}) {
	const nav = useNavigate();
	const disabled = isWorkupDisabled(status);
	const actionLabel = uiConfig(status).action;

	return (
		<div className="flex items-center justify-between gap-3 sm:justify-end">
			<StatusPill status={status} />

			<button
				type="button"
				disabled={disabled}
				className={cx(
					"rounded-lg px-4 py-1.5 text-sm font-medium border",
					"shrink-0",
					disabled ? "bg-subtle text-muted" : "bg-accent text-on-accent",
				)}
				onClick={() =>
					routeToWorkup(nav, {
						status,
						id,
						enrollmentId,
						weekNo,
						patientName,
					})
				}
				aria-label={`${actionLabel} for Week ${weekNo}`}
			>
				{actionLabel}
			</button>
		</div>
	);
}

function WorkupRow({ w, enrollmentId }: { w: WeeklyWorkupStudent; enrollmentId: string }) {
	return (
		<div
			className={cx(
				"w-full rounded-xl border px-4 py-3",
				uiConfig(w.status).border,
				uiConfig(w.status).cardBg,
				"grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,420px)_240px_auto] sm:items-center sm:gap-4",
			)}
		>
			<div className="min-w-0">
				<div className="flex items-center gap-3 min-w-0">
					<div className="text-sm text-primary shrink-0">{`Week ${w.weekNo}`}</div>
					<div className="min-w-0 flex-1">
						<div className="truncate text-sm text-primary">{w.patientName}</div>
					</div>
				</div>

				<div className="mt-1 sm:hidden">
					<WorkupDates start={w.start} end={w.end} />
				</div>

				<div className="sm:hidden mt-2">
					<WorkupActions
						weekNo={w.weekNo}
						id={w.id}
						enrollmentId={enrollmentId}
						status={w.status}
						patientName={w.patientName}
					/>
				</div>
			</div>

			<div className="hidden sm:flex items-center justify-start">
				<WorkupDates start={w.start} end={w.end} />
			</div>

			<div className="hidden sm:flex items-center justify-end">
				<WorkupActions
					weekNo={w.weekNo}
					id={w.id}
					enrollmentId={enrollmentId}
					status={w.status}
					patientName={w.patientName}
				/>
			</div>
		</div>
	);
}

export default function WeeklyWorkupList() {
	const { data, loading, error, refresh } = useStudentWeeks();

	const semesters = useMemo(() => {
		const sems = data ?? [];
		return [...sems].sort((a, b) => {
			const cur = Number(b.currentSemester) - Number(a.currentSemester);
			if (cur !== 0) return cur;
			const year = Number(b.semesterYear) - Number(a.semesterYear);
			if (year !== 0) return year;
			return a.semesterName.localeCompare(b.semesterName);
		});
	}, [data]);

	return (
		<div className="mx-auto w-full max-w-7xl">
			<div className="mb-5">
				<h1 className="text-xl font-semibold text-primary">{COURSE}</h1>
				<p className="mt-1 text-sm text-muted">
					Complete patient case workups and receive AI-powered feedback
				</p>
			</div>

			{loading && (
				<div className="rounded-xl border border-subtle px-4 py-3 text-sm text-muted">
					Loading workups...
				</div>
			)}

			{!loading && error && (
				<div className="rounded-xl border border-subtle px-4 py-3">
					<div className="text-sm font-medium text-primary">Failed to load workups</div>
					<div className="mt-1 text-sm text-muted">{error}</div>
					<button
						type="button"
						className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-on-primary"
						onClick={() => void refresh()}
					>
						Retry
					</button>
				</div>
			)}

			{!loading && !error && semesters.length > 0 && (
				<div className="grid grid-cols-1">
					<div className="flex flex-col gap-6 min-w-0">
						<StatusHelpPanel />
						{semesters
							.filter((sem) => (sem.weeklyWorkups?.length ?? 0) > 0)
							.map((sem) => {
								const sorted = [...sem.weeklyWorkups].sort(
									(a, b) => a.weekNo - b.weekNo,
								);

								return (
									<section key={`${sem.semesterName}-${sem.semesterYear}`}>
										<div className="mb-3 text-sm font-medium text-primary">
											{sem.semesterName} {sem.semesterYear}
											{sem.currentSemester ? (
												<span className="ml-2 text-xs text-muted">
													(Current)
												</span>
											) : null}
										</div>

										<div className="flex flex-col gap-3">
											{sorted.map((w) => (
												<WorkupRow
													key={w.id}
													w={w}
													enrollmentId={sem.enrollmentId}
												/>
											))}
										</div>
									</section>
								);
							})}
					</div>
				</div>
			)}

			{!loading && !error && semesters.length === 0 && (
				<div className="rounded-xl border border-subtle px-4 py-3 text-sm text-muted">
					No workups available.
				</div>
			)}
		</div>
	);
}
