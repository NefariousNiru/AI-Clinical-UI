// file: src/lib/constants/ui.ts

import type { WeeklyWorkupStudentStatus } from "../types/studentWeeks.ts";

export type StatusCfg = {
	pill: string;
	border: string;
	cardBg: string;
	action: string;
};

export const STATUS_UI: Record<WeeklyWorkupStudentStatus, StatusCfg> = {
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
