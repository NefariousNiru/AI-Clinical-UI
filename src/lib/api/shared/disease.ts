// file: src/lib/api/shared/disease.ts

import { DISEASE_SEARCH } from "../../constants/urls.ts";
import { http, withQuery } from "../http.ts";
import { DiseaseSearchResponseSchema } from "../../types/disease.ts";

/**
 * Autocomplete search for diseases.
 * Backend:
 *    GET /api/v1/disease?query=...&limit=...
 */
export async function searchDiseases(query: string, limit = 10) {
	const url = withQuery(DISEASE_SEARCH, { query, limit });
	const resp = await http.get<unknown>(url);
	return DiseaseSearchResponseSchema.parse(resp);
}
