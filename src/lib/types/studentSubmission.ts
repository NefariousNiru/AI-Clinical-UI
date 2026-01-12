// file: src/lib/types/studentSubmission.ts

import { z } from "zod";

/**
 * Student Submission - Frontend Model
 *
 * Goals:
 * - UI works with `undefined` for "empty" fields.
 * - Backend accepts `null` (converted from `undefined`) but requires keys to be present.
 * - Backend might return partial payloads or nulls; UI should still hydrate safely.
 *
 * Notes:
 * - Reflection answers are modeled as Record<string, string> in TS because JSON object keys are strings.
 *   Pydantic dict[int, ...] typically coerces numeric string keys ("1") to int.
 */

/* ----------------------------- Zod helpers ----------------------------- */

/** Convert null/undefined -> undefined for UI fields. */
const optString = z
	.string()
	.nullable()
	.optional()
	.transform((v) => (v == null ? undefined : v));

const optBool = z
	.boolean()
	.nullable()
	.optional()
	.transform((v) => (v == null ? undefined : v));

const optReflectionAnswers = z
	.record(z.string(), z.string())
	.nullable()
	.optional()
	.transform((v) => (v == null ? undefined : v));

/**
 * If backend returns null for an object section, treat it as {} so parsing can proceed.
 * We still hydrate defaults separately in the hooks layer.
 */
function nullishToObject<T extends z.ZodTypeAny>(schema: T) {
	return z.preprocess((v) => (v == null ? {} : v), schema);
}

/* ----------------------------- Schemas ----------------------------- */

export const ProgressNotesSchema = nullishToObject(
	z
		.object({
			chiefComplaint: optString,
			historyOfPresentIllness: optString,
			immunizations: optString,
			progressNotes: optString,
			preliminaryProblemList: optString,
			reflectionAnswers: optReflectionAnswers,
		})
		.passthrough(),
);

export const LabResultSchema = nullishToObject(
	z
		.object({
			labsImagingMicrobiology: optString,
			renalFunctionAssessment: optString,
			reflectionAnswers: optReflectionAnswers,
		})
		.passthrough(),
);

export const MedicationHistorySchema = nullishToObject(
	z
		.object({
			scheduledStartStopDate: optString,
			prn: optString,
		})
		.passthrough(),
);

export const MedicationListSchema = nullishToObject(
	z
		.object({
			/**
			 * Backend requires the key; list may be empty.
			 * If backend returns null, normalize to [] for UI.
			 */
			medications: z
				.array(MedicationHistorySchema)
				.nullable()
				.optional()
				.transform((v) => v ?? []),

			sup: optBool,
			vtePpx: optBool,
			bowelRegimen: optBool,
			ivAccessLineTubes: optString,
			otcCam: optString,
			medicationAdherence: optString,
			reflectionAnswers: optReflectionAnswers,
		})
		.passthrough(),
);

export const MedicalHistorySchema = nullishToObject(
	z
		.object({
			problemList: optString,
			pastMedicalHistory: optString,
			familyHistory: optString,
			reflectionAnswers: optReflectionAnswers,
		})
		.passthrough(),
);

export const SocialHistorySchema = nullishToObject(
	z
		.object({
			occupation: optString,
			supportSystem: optString,
			tobaccoUse: optString,
			thcUse: optString,
			alcoholUse: optString,
			cocaineUse: optString,
			otherSubstanceUse: optString,
		})
		.passthrough(),
);

export const PatientDemographicsSchema = nullishToObject(
	z
		.object({
			name: optString,
			ageDob: optString,
			sex: optString,
			height: optString,
			weight: optString,
			bmi: optString,
			admitVisitDate: optString,
			insurance: optString,
			vitalSigns: optString,
			allergies: optString,
			reflectionAnswers: optReflectionAnswers,
		})
		.passthrough(),
);

export const MrpToolDataSchema = nullishToObject(
	z
		.object({
			patientScenario: optString,
			encounterSetting: optString,
			reflectionAnswers: optReflectionAnswers,
		})
		.passthrough(),
);

export const PatientInfoSchema = nullishToObject(
	z
		.object({
			/**
			 * Backend model marks this Optional, but the UI flow always uses it.
			 * We keep it present in the UI model; API serializer will still send keys with nulls.
			 */
			mrpToolData: MrpToolDataSchema,
			patientDemographics: PatientDemographicsSchema,
			socialHistory: SocialHistorySchema,
			medicalHistory: MedicalHistorySchema,
			medicationList: MedicationListSchema,
			labResult: LabResultSchema,
			progressNotes: ProgressNotesSchema,
		})
		.passthrough(),
);

export const StudentDrpAnswerSchema = nullishToObject(
	z
		.object({
			name: z
				.string()
				.nullable()
				.optional()
				.transform((v) => (v == null ? "" : v)),
			isPriority: z
				.boolean()
				.nullable()
				.optional()
				.transform((v) => Boolean(v)),
			identification: optString,
			explanation: optString,
			planRecommendation: optString,
			monitoring: optString,
		})
		.passthrough(),
);

export const StudentSubmissionPayloadSchema = nullishToObject(
	z
		.object({
			patientInfo: PatientInfoSchema,
			studentDrpAnswers: z
				.array(StudentDrpAnswerSchema)
				.nullable()
				.optional()
				.transform((v) => v ?? []),
		})
		.passthrough(),
);

export const MrpFormDataSchema = nullishToObject(
	z
		.object({
			guidanceText: z
				.string()
				.nullable()
				.optional()
				.transform((v) => v ?? ""),
			reflectionQuestions: z
				.record(z.string(), z.string())
				.nullable()
				.optional()
				.transform((v) => v ?? {}),
		})
		.passthrough(),
);

/* ----------------------------- Types ----------------------------- */

export type ProgressNotes = z.infer<typeof ProgressNotesSchema>;
export type LabResult = z.infer<typeof LabResultSchema>;
export type MedicationHistory = z.infer<typeof MedicationHistorySchema>;
export type MedicationList = z.infer<typeof MedicationListSchema>;
export type MedicalHistory = z.infer<typeof MedicalHistorySchema>;
export type SocialHistory = z.infer<typeof SocialHistorySchema>;
export type PatientDemographics = z.infer<typeof PatientDemographicsSchema>;
export type MrpToolData = z.infer<typeof MrpToolDataSchema>;
export type PatientInfo = z.infer<typeof PatientInfoSchema>;
export type StudentDrpAnswer = z.infer<typeof StudentDrpAnswerSchema>;
export type StudentSubmissionPayload = z.infer<typeof StudentSubmissionPayloadSchema>;
export type MrpFormData = z.infer<typeof MrpFormDataSchema>;

export type StudentSubmissionQuery = {
	weeklyWorkupId: number;
	studentEnrollmentId: string; // UUID
};

/* ----------------------------- Factories ----------------------------- */

/**
 * Create a fresh PatientInfo object with every key present.
 * - Values default to undefined (UI-friendly).
 * - Arrays default to [].
 *
 * This is intentionally a factory (not a constant) to avoid shared references.
 */
export function makeEmptyPatientInfo(): PatientInfo {
	return {
		mrpToolData: {
			patientScenario: undefined,
			encounterSetting: undefined,
			reflectionAnswers: undefined,
		},
		patientDemographics: {
			name: undefined,
			ageDob: undefined,
			sex: undefined,
			height: undefined,
			weight: undefined,
			bmi: undefined,
			admitVisitDate: undefined,
			insurance: undefined,
			vitalSigns: undefined,
			allergies: undefined,
			reflectionAnswers: undefined,
		},
		socialHistory: {
			occupation: undefined,
			supportSystem: undefined,
			tobaccoUse: undefined,
			thcUse: undefined,
			alcoholUse: undefined,
			cocaineUse: undefined,
			otherSubstanceUse: undefined,
		},
		medicalHistory: {
			problemList: undefined,
			pastMedicalHistory: undefined,
			familyHistory: undefined,
			reflectionAnswers: undefined,
		},
		medicationList: {
			medications: [],
			sup: undefined,
			vtePpx: undefined,
			bowelRegimen: undefined,
			ivAccessLineTubes: undefined,
			otcCam: undefined,
			medicationAdherence: undefined,
			reflectionAnswers: undefined,
		},
		labResult: {
			labsImagingMicrobiology: undefined,
			renalFunctionAssessment: undefined,
			reflectionAnswers: undefined,
		},
		progressNotes: {
			chiefComplaint: undefined,
			historyOfPresentIllness: undefined,
			immunizations: undefined,
			progressNotes: undefined,
			preliminaryProblemList: undefined,
			reflectionAnswers: undefined,
		},
	};
}

export function makeEmptyStudentSubmissionPayload(): StudentSubmissionPayload {
	return { patientInfo: makeEmptyPatientInfo(), studentDrpAnswers: [] };
}

/* ----------------------------- Serialization ----------------------------- */

/**
 * Convert a UI model to API JSON:
 * - Keeps all keys that exist on the object.
 * - Converts undefined -> null (so JSON keeps the key).
 *
 * IMPORTANT:
 * - This does NOT invent missing keys. Ensure you start from a factory-shaped object
 *   (makeEmptyPatientInfo / makeEmptyStudentSubmissionPayload) and merge in data.
 */
export function toApiJson<T>(value: T): any {
	if (value === undefined) return null;
	if (value === null) return null;

	if (Array.isArray(value)) return value.map((x) => toApiJson(x));

	if (typeof value === "object") {
		const out: Record<string, any> = {};
		for (const [k, v] of Object.entries(value as any)) out[k] = toApiJson(v);
		return out;
	}

	return value;
}
