// file: src/lib/api/admin/rubric.ts

import {z} from "zod";
import {http} from "../http";
import {
    ADMIN_RUBRIC_BASE,
    ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE,
    ADMIN_RUBRIC_IDS,
} from "../../constants/urls";
import {
    RubricResponseSchema,
    RubricSearchResponseSchema,
    type RubricRequest,
    type RubricResponse,
} from "../../types/rubric";

/**
 * Build a URL with query parameters.
 *
 * Note:
 * - Our `http` wrapper does NOT support `{ params }`
 * - Query params must be encoded manually
 */
function withQuery(
    path: string,
    params: Record<string, string | number | boolean | null | undefined>,
): string {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) continue;
        qs.set(key, String(value));
    }
    const query = qs.toString();
    return query ? `${path}?${query}` : path;
}

/**
 * Autocomplete search for rubrics by partial disease name.
 *
 * Backend:
 *   GET /api/v1/admin/rubric/search?query=...&limit=...
 */
export async function searchRubrics(query: string, limit = 10) {
    const url = withQuery(ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE, {query, limit});
    const resp = await http.get<unknown>(url);
    return RubricSearchResponseSchema.parse(resp);
}

/**
 * Fetch a rubric by rubric_id (canonical disease slug).
 *
 * Backend:
 *   GET /api/v1/admin/rubric?rubric_id=...
 */
export async function getRubricById(rubric_id: string): Promise<RubricResponse> {
    const url = withQuery(ADMIN_RUBRIC_BASE, {rubric_id});
    const resp = await http.get<unknown>(url);
    return RubricResponseSchema.parse(resp);
}

/**
 * Create a new rubric.
 *
 * Backend:
 *   POST /api/v1/admin/rubric
 */
export async function addRubric(payload: RubricRequest): Promise<RubricResponse> {
    const resp = await http.post<unknown>(ADMIN_RUBRIC_BASE, payload);
    return RubricResponseSchema.parse(resp);
}

/**
 * Update (replace) an existing rubric.
 *
 * Backend:
 *   PUT /api/v1/admin/rubric
 */
export async function updateRubric(payload: RubricRequest): Promise<RubricResponse> {
    const resp = await http.put<unknown>(ADMIN_RUBRIC_BASE, payload);
    return RubricResponseSchema.parse(resp);
}

/**
 * Delete a rubric by rubric_id.
 *
 * Backend:
 *   DELETE /api/v1/admin/rubric?rubric_id=...
 */
export async function deleteRubricById(rubric_id: string): Promise<void> {
    const url = withQuery(ADMIN_RUBRIC_BASE, {rubric_id});
    await http.del<unknown>(url);
}

/**
 * Fetch a paginated list of all rubric ids.
 *
 * Backend:
 *   GET /api/v1/admin/rubric/ids?limit=...&offset=...
 */
export async function getAllRubricIds(limit = 20, offset = 0): Promise<string[]> {
    const url = withQuery(ADMIN_RUBRIC_IDS, {limit, offset});
    const resp = await http.get<unknown>(url);
    return z.array(z.string()).parse(resp);
}
