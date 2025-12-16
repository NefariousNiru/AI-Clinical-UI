// file: src/lib/types/rubric.ts

import {z} from "zod";
import {RubricJsonSchema, RubricStatusSchema} from "./rubricSchema";

export const RubricRequestSchema = z
    .object({
        diseaseName: z.string().trim().min(1),
        instructorName: z.string().trim().min(1),
        status: RubricStatusSchema,
        notes: z.string().optional().nullable(),
        file: RubricJsonSchema,
    })
    .strict();

export type RubricRequest = z.infer<typeof RubricRequestSchema>;

export const RubricResponseSchema = z
    .object({
        id: z.number().int(),
        diseaseName: z.string().trim().min(1),
        instructorName: z.string().trim().min(1),
        created: z.number().int(),
        modified: z.number().int(),
        status: RubricStatusSchema,
        notes: z.string().optional().nullable(),
        file: RubricJsonSchema,
    })
    .strict();

export type RubricResponse = z.infer<typeof RubricResponseSchema>;

export const RubricSearchItemSchema = z
    .object({
        diseaseName: z.string().trim().min(1),
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

