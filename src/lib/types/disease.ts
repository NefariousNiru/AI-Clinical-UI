// file: src/lib/types/disease.ts

import { z } from "zod";

/**
 * Request body for POST /api/v1/admin/disease
 *
 * Attributes:
 *   diseases: list of disease names (plain text, backend handles slugging).
 */
export const DiseaseRequest = z.object({
	diseases: z.array(z.string()),
});
export type DiseaseRequest = z.infer<typeof DiseaseRequest>;

/**
 * Response from POST /api/v1/admin/disease
 *
 * Attributes:
 *   created: list of diseases that were created.
 *   skipped: list of diseases that were skipped (e.g. already existed).
 */
export const DiseaseResponse = z.object({
	created: z.array(z.string()),
	skipped: z.array(z.string()),
});
export type DiseaseResponse = z.infer<typeof DiseaseResponse>;

/**
 * Backend returns a plain list of disease names special strings underscored with abbreviations at the last.
 * Example: ["diabetes_mellitus_dm", ...]
 */
export const DiseaseSearchResponseSchema = z.array(z.string().min(0));
export type DiseaseSearchResponse = z.infer<typeof DiseaseSearchResponseSchema>;
