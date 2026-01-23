// file: src/lib/api/admin/studentDeadlines.ts

import { http } from "../http";
import {
	ADMIN_STUDENT_SUBMISSION,
	ADMIN_SUBMISSION_COMMENT,
	ADMIN_SUBMISSION_EXTEND_DEADLINE,
} from "../../constants/urls";
import {
	type ExtendDeadlineRequest,
	ExtendDeadlineRequestSchema,
	type InstructorCommentRequest,
	InstructorCommentRequestSchema,
	type SubmissionViewRequest,
	SubmissionViewRequestSchema,
	type SubmissionViewResponse,
	SubmissionViewResponseSchema,
} from "../../types/studentDeadlines";

/**
 * Get all student submissions for a week.
 * Backend:
 *   POST /api/v1/admin/student_submission
 */
export async function getSubmissionsForWeek(
	payload: SubmissionViewRequest,
): Promise<SubmissionViewResponse> {
	const parsed = SubmissionViewRequestSchema.parse(payload);
	const resp = await http.post<unknown>(ADMIN_STUDENT_SUBMISSION, parsed);
	return SubmissionViewResponseSchema.parse(resp);
}

/**
 * Extend deadline for a student.
 * Backend:
 *   POST /api/v1/admin/student_submission/extend
 */
export async function extendSubmissionDeadline(payload: ExtendDeadlineRequest): Promise<void> {
	const parsed = ExtendDeadlineRequestSchema.parse(payload);
	await http.post<unknown>(ADMIN_SUBMISSION_EXTEND_DEADLINE, parsed);

	// Backend returns None. Accept any response body.
	return;
}

/**
 * Add comment/remarks for a student submission.
 * Backend:
 *   POST /api/v1/admin/student_submission/comment
 */
export async function addSubmissionComment(payload: InstructorCommentRequest): Promise<void> {
	const parsed = InstructorCommentRequestSchema.parse(payload);
	await http.post<unknown>(ADMIN_SUBMISSION_COMMENT, parsed);

	// Backend returns None. Accept any response body.
	return;
}
