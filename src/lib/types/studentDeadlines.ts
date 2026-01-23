// file: src/lib/types/studentDeadlines.ts

import { z } from "zod";
import { WeeklyWorkupStudentStatusSchema } from "./studentWeeks.ts";

export const SubmissionViewSchema = z.object({
	workupId: z.number().int(),
	enrollmentId: z.uuid(),
	status: WeeklyWorkupStudentStatusSchema,
	name: z.string().min(1),
	isCommented: z.boolean(),
});
export type SubmissionView = z.infer<typeof SubmissionViewSchema>;

export const SubmissionViewResponseSchema = z.object({
	submissions: z.array(SubmissionViewSchema).optional(),
	cursor: z.string().nullable().optional(),
	limit: z.number().int(),
});
export type SubmissionViewResponse = z.infer<typeof SubmissionViewResponseSchema>;

export const SubmissionViewRequestSchema = z.object({
	weekId: z.number().int(),
	semesterId: z.number().int(),
	limit: z.number().int(),
	cursor: z.string().nullable().optional(),
});
export type SubmissionViewRequest = z.infer<typeof SubmissionViewRequestSchema>;

export const ExtendDeadlineRequestSchema = z.object({
	weekId: z.number().int(),
	enrollmentId: z.uuid(),
	extendTimestamp: z.number().int(),
	reason: z.string().min(1),
});
export type ExtendDeadlineRequest = z.infer<typeof ExtendDeadlineRequestSchema>;

export const InstructorCommentRequestSchema = z.object({
	weekId: z.number().int(),
	enrollmentId: z.uuid(),
	comment: z.string().min(1),
});
export type InstructorCommentRequest = z.infer<typeof InstructorCommentRequestSchema>;
