// file: src/lib/api/shared/student.ts

import { StudentWeeksResponseSchema } from "../../types/studentWeeks";
import { http, withQuery } from "../http";
import {
	INSTRUCTOR_COMMENTS,
	STUDENT_FEEDBACK,
	STUDENT_MRP_FORM_DATA,
	STUDENT_SUBMISSION,
	STUDENT_WEEKS,
} from "../../constants/urls.ts";
import {
	MrpFormDataSchema,
	type StudentSubmissionPayload,
	StudentSubmissionPayloadSchema,
	type StudentSubmissionQuery,
} from "../../types/studentSubmission.ts";
import { ProblemFeedbackListSchema } from "../../types/feedback.ts";

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

/**
 * GET /api/v1/shared/student/submission?weekly_workup_id=...&student_enrollment_id=...
 */
export async function getStudentSubmission(q: StudentSubmissionQuery) {
	const url = withQuery(STUDENT_SUBMISSION, {
		workup_id: q.weeklyWorkupId,
		enrollment_id: q.studentEnrollmentId,
	});

	const raw = await http.get<unknown>(url);
	return StudentSubmissionPayloadSchema.parse(raw);
}

/**
 * GET /api/v1/shared/student/feedback?workup_id=...&enrollment_id=...
 */
export async function getStudentFeedback(q: StudentSubmissionQuery) {
	const url = withQuery(STUDENT_FEEDBACK, {
		workup_id: q.weeklyWorkupId,
		enrollment_id: q.studentEnrollmentId,
	});

	const raw = await http.get<unknown>(url);
	return ProblemFeedbackListSchema.parse(raw);
}

/**
 * POST /api/v1/shared/student/submission?weekly_workup_id=...&student_enrollment_id=...
 */
export async function saveStudentSubmission(
	q: StudentSubmissionQuery,
	isSubmit: boolean,
	payload: StudentSubmissionPayload,
) {
	const url = withQuery(STUDENT_SUBMISSION, {
		workup_id: q.weeklyWorkupId,
		enrollment_id: q.studentEnrollmentId,
		is_submit: isSubmit,
	});
	const raw = await http.post<unknown>(url, payload);
	return StudentSubmissionPayloadSchema.parse(raw);
}

/**
 * GET /api/v1/shared/student/mrp_form?step=#
 */
export async function getStudentMrpFormData(step: number) {
	const url = withQuery(STUDENT_MRP_FORM_DATA, { step });
	const raw = await http.get<unknown>(url);
	return MrpFormDataSchema.parse(raw);
}

/**
 * Get comment/remarks for a student submission.
 * Backend:
 *   GET /api/v1/admin/student_submission/comment?week_id=...&enrollment_id=...
 *
 * Returns:
 *   string when present, otherwise null
 */
export async function getSubmissionComment(params: {
	week_id: number;
	enrollment_id: string;
}): Promise<string | null> {
	const path = withQuery(INSTRUCTOR_COMMENTS, {
		week_id: params.week_id,
		enrollment_id: params.enrollment_id,
	});
	const res = await http.get<string | null>(path);
	return res ?? null;
}
