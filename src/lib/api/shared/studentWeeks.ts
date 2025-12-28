// file: src/lib/api/shared/studentWeeks.ts

import { StudentWeeksResponseSchema } from "../../types/studentWeeks";
import { http } from "../http";
import {STUDENT_WEEKS} from "../../constants/urls.ts";

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
