// file: src/lib/api/admin/weeklyWorkup.ts

import { http, withQuery } from "../http";
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
	const url = withQuery(ADMIN_WEEKLY_WORKUP_SEMESTER, { semester_id: semesterId });
	const raw = await http.get<unknown>(url);
	return WeeklyWorkupListSchema.parse(raw);
}

/**
 * GET /api/v1/admin/weekly_workup?week_id=...
 * Returns week details (used for view/edit panel).
 */
export async function getWeeklyWorkup(weekId: number): Promise<WeeklyWorkupDetail> {
	const url = withQuery(ADMIN_WEEKLY_WORKUP_BASE, { week_id: weekId });
	const raw = await http.get<unknown>(url);
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
	const url = withQuery(ADMIN_WEEKLY_WORKUP_BASE, { week_id: weekId });
	const body = WeeklyWorkupCreateRequestSchema.parse(payload);
	await http.put<unknown>(url, body);
}
