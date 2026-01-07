// file: src/lib/api/admin/weekly_workup.ts

import { http } from "../http";
import { ADMIN_WEEKLY_WORKUP_BASE, ADMIN_WEEKLY_WORKUP_SEMESTER } from "../../constants/urls";
import type { WeeklyWorkupCreateRequest, WeeklyWorkupDetail, WeeklyWorkupListItem, } from "../../types/weeks";
import { WeeklyWorkupCreateRequestSchema, WeeklyWorkupDetailSchema, WeeklyWorkupListSchema, } from "../../types/weeks";

/**
 * GET /api/v1/admin/weekly_workup/semester?semester_id=...
 * Lists all weeks for the selected semester.
 */
export async function listWeeklyWorkupsForSemester(
	semesterId: number,
): Promise<WeeklyWorkupListItem[]> {
	const qs = new URLSearchParams({ semester_id: String(semesterId) }).toString();
	const raw = await http.get<unknown>(`${ADMIN_WEEKLY_WORKUP_SEMESTER}?${qs}`);
	return WeeklyWorkupListSchema.parse(raw);
}

/**
 * GET /api/v1/admin/weekly_workup?week_id=...
 * Returns week details (used for view/edit panel).
 */
export async function getWeeklyWorkup(weekId: number): Promise<WeeklyWorkupDetail> {
	const qs = new URLSearchParams({ week_id: String(weekId) }).toString();
	const raw = await http.get<unknown>(`${ADMIN_WEEKLY_WORKUP_BASE}?${qs}`);
	return WeeklyWorkupDetailSchema.parse(raw);
}

/**
 * POST /api/v1/admin/weekly_workup
 * Creates a new week.
 *
 * Backend returns 200 with no response body.
 */
export async function createWeeklyWorkup(payload: WeeklyWorkupCreateRequest): Promise<void> {
	const body = WeeklyWorkupCreateRequestSchema.parse(payload);
	await http.post<unknown>(ADMIN_WEEKLY_WORKUP_BASE, body);
}

/**
 * PUT /api/v1/admin/weekly_workup?week_id=...
 * Updates patient name + dates + diseaseNames.
 *
 * Backend returns 200 with no response body.
 */
export async function updateWeeklyWorkup(
	weekId: number,
	payload: WeeklyWorkupCreateRequest,
): Promise<void> {
	const qs = new URLSearchParams({ week_id: String(weekId) }).toString();
	const body = WeeklyWorkupCreateRequestSchema.parse(payload);
	await http.put<unknown>(`${ADMIN_WEEKLY_WORKUP_BASE}?${qs}`, body);
}
