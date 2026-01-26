// file: src/pages/student/hooks/routeToWorkup.ts

import { useNavigate } from "react-router-dom";
import type { ViewStatus, WeeklyWorkupStudentStatus } from "../../../lib/types/studentWeeks.ts";
import { STUDENT_WORKUP } from "../../../routes.ts";

export function isWorkupDisabled(status: WeeklyWorkupStudentStatus): boolean {
	return status === "locked" || status === "not_submitted";
}

export function isEditable(status: WeeklyWorkupStudentStatus): boolean {
	return status === "available" || status === "in_progress" || status === "submitted";
}

export function isViewOnly(status: WeeklyWorkupStudentStatus): status is ViewStatus {
	return status === "grading" || status === "feedback_available";
}

export function routeToWorkup(
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
