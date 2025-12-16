// file: src/lib/api/admin/semester.ts

import {http} from "../http";
import {
    type Semester,
    type SemesterCreateRequest,
    SemesterCreateRequestSchema,
    SemesterListSchema,
    type SemesterName,
    SemesterSchema,
} from "../../types/semester";
import {ADMIN_ALL_SEMESTER, ADMIN_SEMESTER_BASE} from "../../constants/urls";

/**
 * GET /api/v1/admin/semester/all
 */
export async function fetchAllSemesters(): Promise<Semester[]> {
    const resp = await http.get<unknown>(ADMIN_ALL_SEMESTER);
    return SemesterListSchema.parse(resp);
}

/**
 * GET /api/v1/admin/semester?name=Spring&year=2026
 */
export async function fetchSemesterByNameYear(
    name: SemesterName,
    year: number | string,
): Promise<Semester> {
    const url =
        `${ADMIN_SEMESTER_BASE}` +
        `?name=${encodeURIComponent(name)}` +
        `&year=${encodeURIComponent(String(year))}`;

    const resp = await http.get<unknown>(url);
    return SemesterSchema.parse(resp);
}

/**
 * POST /api/v1/admin/semester
 */
export async function createSemester(
    body: SemesterCreateRequest,
): Promise<void> {
    const payload = SemesterCreateRequestSchema.parse(body);
    await http.post<unknown>(ADMIN_SEMESTER_BASE, payload);
    return
}
