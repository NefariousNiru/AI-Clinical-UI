// file: src/lib/types/rubric.ts

import { z } from "zod";

/**
 * Single autocomplete result for a rubric/disease.
 *
 * diseaseName: canonical disease slug.
 * rubricExists: true if a rubric already exists for this disease.
 */
export const RubricSearchItem = z.object({
    diseaseName: z.string(),
    rubricExists: z.boolean(),
});
export type RubricSearchItem = z.infer<typeof RubricSearchItem>;

/**
 * List of rubric search items.
 */
export const RubricSearchItemList = z.array(RubricSearchItem);
export type RubricSearchItemList = z.infer<typeof RubricSearchItemList>;

/**
 * Full response shape from GET /api/v1/admin/rubric/search.
 *
 * results: array of RubricSearchItem.
 */
export const RubricSearchResponse = z.object({
    results: RubricSearchItemList,
});
export type RubricSearchResponse = z.infer<typeof RubricSearchResponse>;
