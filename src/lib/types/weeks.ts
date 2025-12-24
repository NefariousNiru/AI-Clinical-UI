// file: src/lib/types/weeks.ts

import {z} from "zod";

/**
 * Weekly workup status.
 *
 * Domain note:
 * - "locked" = future (editable)
 * - "available" = current/past (view-only)
 */
export const WeeklyWorkupStatusSchema = z.enum(["locked", "available", "feedback_available"]);
export type WeeklyWorkupStatus = z.infer<typeof WeeklyWorkupStatusSchema>;

export const WeeklyWorkupListItemSchema = z.object({
    id: z.number().int(),
    semesterId: z.number().int(),
    weekNo: z.number().int(),
    patientFirstName: z.string(),
    patientLastName: z.string(),
    start: z.number().int(), // unix seconds
    end: z.number().int(), // unix seconds
    status: WeeklyWorkupStatusSchema,
});
export type WeeklyWorkupListItem = z.infer<typeof WeeklyWorkupListItemSchema>;

export const WeeklyWorkupListSchema = z.array(WeeklyWorkupListItemSchema);

export const WeeklyWorkupDetailSchema = z.object({
    semesterName: z.string(),
    semesterYear: z.string(),
    weekNo: z.number().int(),
    patientFirstName: z.string(),
    patientLastName: z.string(),
    start: z.number().int(), // unix seconds
    end: z.number().int(), // unix seconds
    diseaseNames: z.array(z.string()),
});
export type WeeklyWorkupDetail = z.infer<typeof WeeklyWorkupDetailSchema>;

export const WeeklyWorkupCreateRequestSchema = z.object({
    semesterName: z.string().min(1),
    semesterYear: z.string().regex(/^\d+$/, "semesterYear must be numeric"),
    weekNo: z.number().int(),
    patientFirstName: z.string(),
    patientLastName: z.string(),
    start: z.number().int(),
    end: z.number().int(),
    diseaseNames: z.array(z.string()).default([]),
});
export type WeeklyWorkupCreateRequest = z.infer<typeof WeeklyWorkupCreateRequestSchema>;
