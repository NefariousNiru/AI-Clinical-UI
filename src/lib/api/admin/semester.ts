// file: src/lib/api/admin/semester.ts

import { http } from "../http";
import {
	type Semester,
	type SemesterCreateRequest,
	SemesterCreateRequestSchema,
	SemesterListSchema,
} from "../../types/semester";
import { ADMIN_ALL_SEMESTER, ADMIN_SEMESTER_BASE } from "../../constants/urls";

/**
 * GET /api/v1/admin/semester/all
 */
export async function fetchAllSemesters(): Promise<Semester[]> {
	const resp = await http.get<unknown>(ADMIN_ALL_SEMESTER);
	return SemesterListSchema.parse(resp);
}

/**
 * POST /api/v1/admin/semester
 */
export async function createSemester(body: SemesterCreateRequest): Promise<void> {
	const payload = SemesterCreateRequestSchema.parse(body);
	await http.post<unknown>(ADMIN_SEMESTER_BASE, payload);
	return;
}
