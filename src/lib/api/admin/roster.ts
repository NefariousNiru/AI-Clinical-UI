// file: src/lib/api/admin/roster.ts

import { http } from "../http";
import {
	type AddRosterRequest,
	AddRosterRequestSchema,
	type DisableSemesterRequest,
	DisableSemesterRequestSchema,
	type NotifyActivationRequest,
	NotifyActivationRequestSchema,
	type RosterResponse,
	RosterResponseSchema,
} from "../../types/roster";
import {
	ADMIN_DISABLE_SEMESTER,
	ADMIN_DISABLE_USER,
	ADMIN_NOTIFY_ACCOUNT,
	ADMIN_NOTIFY_ENROLLMENT,
	ADMIN_STUDENT_ROSTER,
} from "../../constants/urls.ts";

/**
 * GET /api/v1/admin/roster?semester_id=some_int
 */
export async function fetchRoster(semesterId: number): Promise<RosterResponse> {
	const url = `${ADMIN_STUDENT_ROSTER}?semester_id=${encodeURIComponent(String(semesterId))}`;
	const resp = await http.get<unknown>(url);
	return RosterResponseSchema.parse(resp);
}

/**
 * POST /api/v1/admin/roster
 */
export async function addRosterStudents(body: AddRosterRequest): Promise<RosterResponse> {
	const payload = AddRosterRequestSchema.parse(body);
	const resp = await http.post<unknown>(ADMIN_STUDENT_ROSTER, payload);
	return RosterResponseSchema.parse(resp);
}

/**
 * PATCH /api/v1/admin/roster/disable/semester
 */
export async function deactivateSemesterEnrollments(enrollmentIds: string[]): Promise<void> {
	const payload: DisableSemesterRequest = DisableSemesterRequestSchema.parse({
		enrollmentIds,
	});
	await http.patch<unknown>(ADMIN_DISABLE_SEMESTER, payload);
}

/**
 * PATCH /api/v1/admin/roster/disable/user?user_id=UUID
 */
export async function deactivateUserAccount(userId: string): Promise<void> {
	const url = `${ADMIN_DISABLE_USER}?user_id=${encodeURIComponent(userId)}`;
	await http.patch<unknown>(url, {});
}

/**
 * POST /api/v1/admin/roster/notify/account
 */
export async function notifyAccountActivation(body: NotifyActivationRequest): Promise<void> {
	const payload = NotifyActivationRequestSchema.parse(body);
	await http.post<unknown>(ADMIN_NOTIFY_ACCOUNT, payload);
}

/**
 * POST /api/v1/admin/roster/notify/enrollment
 */
export async function notifyEnrollmentActivation(body: NotifyActivationRequest): Promise<void> {
	const payload = NotifyActivationRequestSchema.parse(body);
	await http.post<unknown>(ADMIN_NOTIFY_ENROLLMENT, payload);
}
