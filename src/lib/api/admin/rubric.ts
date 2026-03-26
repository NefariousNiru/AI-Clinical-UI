// file: src/lib/api/admin/rubric.ts

import { z } from "zod";
import { http, withQuery } from "../http";
import {
	ADMIN_RUBRIC_ALL_PATIENTS,
	ADMIN_RUBRIC_BASE,
	ADMIN_RUBRIC_IDS,
	ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE,
} from "../../constants/urls";
import {
	type RubricRequest,
	RubricRequestSchema,
	type RubricResponse,
	RubricResponseSchema,
	RubricSearchResponseSchema,
} from "../../types/rubric";

/**
 * Search rubrics for autocomplete.
 * Backend:
 * 		GET /api/v1/admin/rubric/search_autocomplete
 */
export async function searchRubrics(query: string, limit = 10) {
	const url = withQuery(ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE, { query, limit });
	const resp = await http.get<unknown>(url);
	return RubricSearchResponseSchema.parse(resp);
}

/**
 * Fetch a rubric by unique (disease_name, patient_last_name).
 *
 * Backend:
 *   GET /api/v1/admin/rubric?disease_name=...&patient_last_name=...
 */
export async function getRubricByUnique(
	diseaseName: string,
	patientLastName: string,
): Promise<RubricResponse> {
	const url = withQuery(ADMIN_RUBRIC_BASE, {
		disease_name: diseaseName,
		patient_last_name: patientLastName,
	});
	const resp = await http.get<unknown>(url);
	return RubricResponseSchema.parse(resp);
}

/**
 * List all patients (constant list).
 *
 * Backend:
 *   GET /api/v1/admin/rubric/patients
 */
export async function getAllRubricPatients(): Promise<string[]> {
	const resp = await http.get<unknown>(ADMIN_RUBRIC_ALL_PATIENTS);
	return z.array(z.string()).parse(resp);
}

/** Create rubric. Backend: POST /api/v1/admin/rubric */
export async function addRubric(payload: RubricRequest): Promise<RubricResponse> {
	const body = RubricRequestSchema.parse(payload);
	const resp = await http.post<unknown>(ADMIN_RUBRIC_BASE, body);
	return RubricResponseSchema.parse(resp);
}

/**
 * Update a rubric
 *
 * Backend:
 *   PUT /api/v1/admin/rubric
 */
export async function updateRubric(payload: RubricRequest): Promise<RubricResponse> {
	const body = RubricRequestSchema.parse(payload);
	const resp = await http.put<unknown>(ADMIN_RUBRIC_BASE, body);
	return RubricResponseSchema.parse(resp);
}

/**
 * Fetch rubric ids (disease slugs) for a given patient last name.
 *
 * Backend:
 *   GET /api/v1/admin/rubric/ids?patient_last_name=...&limit=...&offset=...
 *
 * Note:
 * - Returns ONLY diseases where a rubric exists for that patient last name.
 */
export async function getAllRubricIds(
	patientLastName: string,
	limit = 20,
	offset = 0,
): Promise<string[]> {
	const url = withQuery(ADMIN_RUBRIC_IDS, { patient_last_name: patientLastName, limit, offset });
	const resp = await http.get<unknown>(url);
	return z.array(z.string()).parse(resp);
}
