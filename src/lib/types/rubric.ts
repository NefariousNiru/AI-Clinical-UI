// file: src/lib/types/rubric.ts

import {z} from "zod";

/**
 * Search result item for rubric autocomplete.
 */
export const RubricSearchItemSchema = z
    .object({
        diseaseName: z.string(),
        rubricExists: z.boolean(),
    })
    .strict();

export type RubricSearchItem = z.infer<typeof RubricSearchItemSchema>;

/**
 * Search response for rubric autocomplete.
 */
export const RubricSearchResponseSchema = z
    .object({
        results: z.array(RubricSearchItemSchema),
    })
    .strict();

export type RubricSearchResponse = z.infer<typeof RubricSearchResponseSchema>;

/**
 * Backend RubricResponse envelope.
 *
 * IMPORTANT:
 * - `file` is NOT validated here (it's `unknown`).
 * - The rubric editor hook owns normalization + strict validation via RubricJsonSchema.
 */
export const RubricResponseSchema = z
    .object({
        id: z.number().int(),
        diseaseName: z.string(),
        instructorName: z.string(),
        created: z.number().int(),
        modified: z.number().int(),
        status: z.string(),
        notes: z.string().nullable().optional(),
        file: z.unknown(),
    })
    .strict();

export type RubricResponse = z.infer<typeof RubricResponseSchema>;

