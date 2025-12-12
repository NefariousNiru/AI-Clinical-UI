// file: src/lib/types/semester.ts

import { z } from "zod";

/**
 * Canonical semester names we use in the UI and query params.
 * Backend sends `name` as "Spring" | "Summer" | "Fall".
 */
export const SemesterNameSchema = z.enum(["Spring", "Summer", "Fall"]);
export type SemesterName = z.infer<typeof SemesterNameSchema>;

/**
 * Backend semester shape:
 * {
 *   "id": 1,
 *   "name": "Spring",
 *   "year": "2026",
 *   "start": 1768194000,
 *   "end": 1778212800,
 *   "isCurrent": true
 * }
 */
export const SemesterSchema = z.looseObject({
    id: z.number().int(),
    name: SemesterNameSchema,
    year: z.union([z.string().regex(/^\d+$/), z.number().int()]),
    start: z.number().int(),
    end: z.number().int(),
    isCurrent: z.boolean(),
});

export type Semester = z.infer<typeof SemesterSchema>;

export const SemesterListSchema = z.array(SemesterSchema);
export type SemesterList = z.infer<typeof SemesterListSchema>;

/**
 * POST /api/v1/admin/semester payload.
 *
 * Note: backend expects epoch millis (per your note) - keep as number.
 */
export const SemesterCreateRequestSchema = z.object({
    name: SemesterNameSchema,
    year: z.union([z.string().regex(/^\d+$/), z.number().int()]),
    start: z.number().int(),
    end: z.number().int(),
    isCurrent: z.boolean().optional(),
});

export type SemesterCreateRequest = z.infer<typeof SemesterCreateRequestSchema>;
