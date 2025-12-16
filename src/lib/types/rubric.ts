// file: src/lib/types/rubric.ts

import {z} from "zod";
import {RubricJsonSchema, RubricStatusSchema, type RubricJson, type RubricStatus} from "./rubricSchema";

const NonEmptyStr = z.string().trim().min(1);

export const RubricRequestSchema = z
    .object({
        diseaseName: NonEmptyStr,
        instructorName: NonEmptyStr,
        status: RubricStatusSchema,
        notes: z.string().optional().nullable(),
        file: RubricJsonSchema,
    })
    .strict();

export type RubricRequest = z.infer<typeof RubricRequestSchema>;

export const RubricResponseSchema = z
    .object({
        id: z.number().int(),
        diseaseName: NonEmptyStr,
        instructorName: NonEmptyStr,
        created: z.number().int().nonnegative(),
        modified: z.number().int().nonnegative(),
        status: RubricStatusSchema,
        notes: z.string().optional().nullable(),
        file: RubricJsonSchema,
    })
    .strict();

export type RubricResponse = z.infer<typeof RubricResponseSchema>;

export const RubricSearchItemSchema = z
    .object({
        diseaseName: NonEmptyStr,
        rubricExists: z.boolean(),
    })
    .strict();

export type RubricSearchItem = z.infer<typeof RubricSearchItemSchema>;

export const RubricSearchResponseSchema = z
    .object({
        results: z.array(RubricSearchItemSchema),
    })
    .strict();

export type RubricSearchResponse = z.infer<typeof RubricSearchResponseSchema>;

export type {RubricJson, RubricStatus};
