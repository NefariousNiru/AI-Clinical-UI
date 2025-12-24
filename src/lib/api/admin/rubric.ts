// file: src/lib/api/admin/rubric.ts

import {z} from "zod";
import {http} from "../http";
import {
    ADMIN_RUBRIC_BASE,
    ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE,
    ADMIN_RUBRIC_IDS,
    ADMIN_RUBRIC_ALL_PATIENTS,
} from "../../constants/urls";
import {
    RubricResponseSchema,
    RubricSearchResponseSchema,
    type RubricRequest,
    type RubricResponse,
    RubricRequestSchema,
} from "../../types/rubric";

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

export async function searchRubrics(query: string, limit = 10) {
    const url = withQuery(ADMIN_RUBRIC_SEARCH_AUTOCOMPLETE, {query, limit});
    const resp = await http.get<unknown>(url);
    return RubricSearchResponseSchema.parse(resp);
}

/**
 * Fetch a rubric by unique (disease_name, patient_last_name).
 *
 * Backend:
 *   GET /api/v1/admin/rubric?disease_name=...&patient_last_name=...
 */
export async function getRubricByUnique(diseaseName: string, patientLastName: string): Promise<RubricResponse> {
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

export async function addRubric(payload: RubricRequest): Promise<RubricResponse> {
    const body = RubricRequestSchema.parse(payload);
    const resp = await http.post<unknown>(ADMIN_RUBRIC_BASE, body);
    return RubricResponseSchema.parse(resp);
}

export async function updateRubric(payload: RubricRequest): Promise<RubricResponse> {
    const body = RubricRequestSchema.parse(payload);
    const resp = await http.put<unknown>(ADMIN_RUBRIC_BASE, body);
    return RubricResponseSchema.parse(resp);
}

export async function deleteRubricById(rubric_id: string): Promise<void> {
    const url = withQuery(ADMIN_RUBRIC_BASE, {rubric_id});
    await http.del<unknown>(url);
}

export async function getAllRubricIds(limit = 20, offset = 0): Promise<string[]> {
    const url = withQuery(ADMIN_RUBRIC_IDS, {limit, offset});
    const resp = await http.get<unknown>(url);
    return z.array(z.string()).parse(resp);
}
