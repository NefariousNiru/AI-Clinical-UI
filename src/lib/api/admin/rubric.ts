// file: src/lib/api/admin/rubric.ts

import { http } from "../http";
import {
    RubricSearchResponse as RubricSearchResponseSchema,
    type RubricSearchResponse,
} from "../../types/rubric";
import { ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE } from "../../constants/urls";

/**
 * GET /api/v1/admin/rubric/search
 *
 * Autocomplete search for rubrics by disease text.
 *
 * Params:
 *   query: partial disease text (min 3 chars)
 *   limit: max results (hard-coded to 10 by caller, but configurable)
 *
 * Returns:
 *   Zod-validated RubricSearchResponse: { results: RubricSearchItem[] }
 */
export async function searchRubrics(
    query: string,
    limit = 10,
): Promise<RubricSearchResponse> {
    const trimmed = query.trim();

    // Short-circuit for tiny queries so we don't spam the backend.
    if (trimmed.length < 3) {
        return { results: [] };
    }

    // Build query string manually because http.get only accepts a single argument
    const url =
        `${ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE}` +
        `?query=${encodeURIComponent(trimmed)}` +
        `&limit=${encodeURIComponent(String(limit))}`;

    const resp = await http.get<unknown>(url);

    // Validate and normalize via zod
    return RubricSearchResponseSchema.parse(resp);
}
