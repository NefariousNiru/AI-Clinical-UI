// file: src/lib/api/shared/studentSubmission.ts

import { StudentWeeksResponseSchema } from "../../types/studentWeeks";
import { http } from "../http";
import { STUDENT_MRP_FORM_DATA, STUDENT_SUBMISSION, STUDENT_WEEKS } from "../../constants/urls.ts";
import {
	MrpFormDataSchema,
	type StudentSubmissionPayload,
	StudentSubmissionPayloadSchema,
	type StudentSubmissionQuery,
} from "../../types/studentSubmission.ts";

/**
 * GET /api/v1/shared/student/weeks (via STUDENT_WEEKS)
 *
 * Returns the student's weekly workups grouped by semester.
 * Uses zod to validate the server response.
 */
export async function listStudentWeeks() {
	const raw = await http.get<unknown>(STUDENT_WEEKS);
	return StudentWeeksResponseSchema.parse(raw);
}

function submissionQs(q: StudentSubmissionQuery): string {
	const params = new URLSearchParams({
		workup_id: String(q.weeklyWorkupId),
		enrollment_id: q.studentEnrollmentId,
	});
	return params.toString();
}

/**
 * GET /api/v1/shared/student/submission?weekly_workup_id=...&student_enrollment_id=...
 */
export async function getStudentSubmission(q: StudentSubmissionQuery) {
	const raw = await http.get<unknown>(`${STUDENT_SUBMISSION}?${submissionQs(q)}`);
	return StudentSubmissionPayloadSchema.parse(raw);
}

/**
 * POST /api/v1/shared/student/submission?weekly_workup_id=...&student_enrollment_id=...
 */
export async function saveStudentSubmission(
	q: StudentSubmissionQuery,
	payload: StudentSubmissionPayload,
) {
	const raw = await http.post<unknown>(`${STUDENT_SUBMISSION}?${submissionQs(q)}`, payload);
	return StudentSubmissionPayloadSchema.parse(raw);
}

/**
 * GET /api/v1/shared/student/mrp_form?step=#
 */
export async function getStudentMrpFormData(step: number) {
	const raw = await http.get<unknown>(
		`${STUDENT_MRP_FORM_DATA}?step=${encodeURIComponent(step)}`,
	);
	return MrpFormDataSchema.parse(raw);
}
