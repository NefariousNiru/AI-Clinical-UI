// file: src/lib/types/studentWeeks.ts

import {z} from "zod";
import {SemesterNameSchema} from "./semester";

/**
 * Weekly workup status values sent by backend.
 */
export const WeeklyWorkupStudentStatusSchema = z.enum([
    "locked",
    "available",
    "in_progress",
    "submitted",
    "grading",
    "not_submitted",
    "feedback_available",
]);
export type WeeklyWorkupStudentStatus = z.infer<typeof WeeklyWorkupStudentStatusSchema>;

export const WeeklyWorkupStudentSchema = z.object({
    id: z.number().int().nonnegative(),
    weekNo: z.number().int().positive(),
    patientName: z.string().min(1),
    start: z.number().int(),
    end: z.number().int(),
    status: WeeklyWorkupStudentStatusSchema,
});
export type WeeklyWorkupStudent = z.infer<typeof WeeklyWorkupStudentSchema>;

export const WeeklyWorkupStudentViewSchema = z.object({
    semesterName: SemesterNameSchema,
    semesterYear: z.string().regex(/^\d{4}$/),
    currentSemester: z.boolean(),
    isEnrolled: z.boolean(),
    weeklyWorkups: z.array(WeeklyWorkupStudentSchema),
});
export type WeeklyWorkupStudentView = z.infer<typeof WeeklyWorkupStudentViewSchema>;

/**
 * GET /student/weeks response
 */
export const StudentWeeksResponseSchema = z.array(WeeklyWorkupStudentViewSchema);
export type StudentWeeksResponse = z.infer<typeof StudentWeeksResponseSchema>;
