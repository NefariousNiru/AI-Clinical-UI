// file: src/pages/student/WeeklyWorkups.tsx

import { useMemo } from "react";
import { Calendar, Clock } from "lucide-react";
import { useStudentWeeks } from "./hooks/studentWeeks";
import type { WeeklyWorkupStudent, WeeklyWorkupStudentStatus } from "../../lib/types/studentWeeks";
import { titleizeCase, unixToIsoDate } from "../../lib/utils/functions";
import { useNavigate } from "react-router-dom";
import { useMrpToolStatus } from "../shared/hooks/mrpToolStatus.ts";
import { STATUS_HELP } from "./hooks/constants.ts";

type StatusCfg = {
	pill: string;
	border: string;
	cardBg: string;
	action: string;
};

const STATUS_UI: Record<WeeklyWorkupStudentStatus, StatusCfg> = {
	locked: {
		pill: "bg-status-locked text-status-locked",
		border: "border-status-locked",
		cardBg: "bg-status-locked-card",
		action: "Locked",
	},
	available: {
		pill: "bg-status-available text-status-available",
		border: "border-status-available",
		cardBg: "bg-status-available-card",
		action: "Start",
	},
	in_progress: {
		pill: "bg-status-progress text-status-progress",
		border: "border-status-progress",
		cardBg: "bg-status-progress-card",
		action: "Resume",
	},
	submitted: {
		pill: "bg-status-submitted text-status-submitted",
		border: "border-status-submitted",
		cardBg: "bg-status-submitted-card",
		action: "Edit",
	},
	grading: {
		pill: "bg-status-grading text-status-grading",
		border: "border-status-grading",
		cardBg: "bg-status-grading-card",
		action: "View",
	},
	not_submitted: {
		pill: "bg-status-missed text-status-missed",
		border: "border-status-missed",
		cardBg: "bg-status-missed-card",
		action: "Closed",
	},
	feedback_available: {
		pill: "bg-status-feedback text-status-feedback",
		border: "border-status-feedback",
		cardBg: "bg-status-feedback-card",
		action: "Show",
	},
};

const FALLBACK: StatusCfg = {
	pill: "bg-secondary-soft text-secondary",
	border: "border-subtle",
	cardBg: "bg-subtle",
	action: "View",
};

function cfg(status: WeeklyWorkupStudentStatus): StatusCfg {
	return STATUS_UI[status] ?? FALLBACK;
}

function canOpenMrp(status: WeeklyWorkupStudentStatus): boolean {
	return (
		status === "available" ||
		status === "in_progress" ||
		status === "submitted" ||
		status === "grading"
	);
}

export function workupTileCardBgClasses(status: WeeklyWorkupStudentStatus): string {
	return cfg(status).cardBg;
}

export function workupTileBorderClasses(status: WeeklyWorkupStudentStatus): string {
	return cfg(status).border;
}

export function workupStatusPillClasses(status: WeeklyWorkupStudentStatus): string {
	return cfg(status).pill;
}

export function workupPrimaryActionLabel(status: WeeklyWorkupStudentStatus): string {
	return cfg(status).action;
}

function cx(...xs: Array<string | false | null | undefined>) {
	return xs.filter(Boolean).join(" ");
}

function formatUnixShortDate(unixSeconds: number): string {
	const iso = unixToIsoDate(unixSeconds);
	const d = new Date(iso);
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StatusPill({ status }: { status: WeeklyWorkupStudent["status"] }) {
	return (
		<span
			className={cx(
				"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
				workupStatusPillClasses(status),
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
	const startLabel = formatUnixShortDate(start);
	const endLabel = formatUnixShortDate(end);
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

			<div className="mt-4 flex flex-col gap-3">
				{STATUS_HELP.map((it) => (
					<div key={it.status} className="flex items-start gap-3">
						<span
							className={cx(
								"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
								workupStatusPillClasses(it.status),
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

function WorkupActions({
	weekNo,
	id,
	enrollmentId,
	status,
	patientName,
	mrpEnabled,
}: {
	weekNo: number;
	id: number;
	enrollmentId: string; // UUID
	status: WeeklyWorkupStudentStatus;
	patientName: string;
	mrpEnabled: boolean;
}) {
	const nav = useNavigate();
	const disabled = status === "locked" || status === "not_submitted";
	const actionLabel = workupPrimaryActionLabel(status);

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
				onClick={() => {
					// only mount wizard for these statuses AND only if enabled
					if (mrpEnabled && canOpenMrp(status)) {
						nav("workup", {
							state: {
								weeklyWorkupId: id,
								studentEnrollmentId: enrollmentId,
								weekNo: weekNo,
								patientName: patientName,
							},
						});
						return;
					}

					// TODO: fallback: keep existing behavior
					console.log("workup action:", { id, status, mrpEnabled });
				}}
				aria-label={`${actionLabel} for Week ${weekNo}`}
			>
				{actionLabel}
			</button>
		</div>
	);
}

function WorkupRow({
	w,
	enrollmentId,
	mrpEnabled,
}: {
	w: WeeklyWorkupStudent;
	enrollmentId: string;
	mrpEnabled: boolean;
}) {
	const disabled = w.status === "locked" || w.status === "not_submitted";

	return (
		<div
			className={cx(
				"w-full rounded-xl border px-4 py-3",
				workupTileBorderClasses(w.status),
				workupTileCardBgClasses(w.status),
				disabled && "opacity-60",
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
						mrpEnabled={mrpEnabled}
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
					mrpEnabled={mrpEnabled}
					patientName={w.patientName}
				/>
			</div>
		</div>
	);
}

export default function WeeklyWorkups() {
	const { data, loading, error, refresh } = useStudentWeeks();
	const { enabled: mrpEnabled } = useMrpToolStatus();

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
				<h1 className="text-xl font-semibold text-primary">My Workups</h1>
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
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
					<div className="lg:sticky lg:top-6 h-fit">
						<StatusHelpPanel />
					</div>

					<div className="flex flex-col gap-6 min-w-0">
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
													mrpEnabled={mrpEnabled}
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
