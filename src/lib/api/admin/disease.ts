// file: src/lib/api/admin/disease.ts

import { http } from "../http";
import { ADMIN_DISEASE } from "../../constants/urls";
import {
	DiseaseRequest as DiseaseRequestSchema,
	DiseaseResponse as DiseaseResponseSchema,
	type DiseaseResponse,
} from "../../types/disease";

/**
 * POST /api/v1/admin/disease
 *
 * Adds diseases in bulk, but this helper adds a single disease name.
 *
 * Args:
 *   name: disease name as plain text (backend handles slug normalization).
 *
 * Returns:
 *   Zod-validated DiseaseResponse: { created: string[], skipped: string[] }.
 */
export async function addDisease(name: string): Promise<DiseaseResponse> {
	const payload = DiseaseRequestSchema.parse({
		diseases: [name],
	});
	const resp = await http.post<unknown>(ADMIN_DISEASE, payload);
	return DiseaseResponseSchema.parse(resp);
}
