// file: src/lib/types/student.ts

import { z } from "zod";

/**
 * Helpers
 * - Backend requires keys present (nullable ok).
 * - UI prefers undefined over null.
 */

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
 * PatientInfo
 */

export const ProgressNotesSchema = z.object({
	chiefComplaint: optString,
	historyOfPresentIllness: optString,
	immunizations: optString,
	progressNotes: optString,
	preliminaryProblemList: optString,
	reflectionAnswers: optReflectionAnswers,
});

export const LabResultSchema = z.object({
	labsImagingMicrobiology: optString,
	renalFunctionAssessment: optString,
	reflectionAnswers: optReflectionAnswers,
});

export const MedicationHistorySchema = z.object({
	scheduledStartStopDate: optString,
	prn: optString,
});

export const MedicationListSchema = z.object({
	// If backend ever returns null, we still want [] in the UI.
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
});

export const MedicalHistorySchema = z.object({
	problemList: optString,
	pastMedicalHistory: optString,
	familyHistory: optString,
	reflectionAnswers: optReflectionAnswers,
});

export const SocialHistorySchema = z.object({
	occupation: optString,
	supportSystem: optString,
	tobaccoUse: optString,
	thcUse: optString,
	alcoholUse: optString,
	cocaineUse: optString,
	otherSubstanceUse: optString,
});

export const PatientDemographicsSchema = z.object({
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
});

export const MrpToolDataSchema = z.object({
	patientScenario: optString,
	encounterSetting: optString,
	reflectionAnswers: optReflectionAnswers,
});

export const PatientInfoSchema = z.object({
	mrpToolData: MrpToolDataSchema,
	patientDemographics: PatientDemographicsSchema,
	socialHistory: SocialHistorySchema,
	medicalHistory: MedicalHistorySchema,
	medicationList: MedicationListSchema,
	labResult: LabResultSchema,
	progressNotes: ProgressNotesSchema,
});

export type ProgressNotes = z.infer<typeof ProgressNotesSchema>;
export type LabResult = z.infer<typeof LabResultSchema>;
export type MedicationHistory = z.infer<typeof MedicationHistorySchema>;
export type MedicationList = z.infer<typeof MedicationListSchema>;
export type MedicalHistory = z.infer<typeof MedicalHistorySchema>;
export type SocialHistory = z.infer<typeof SocialHistorySchema>;
export type PatientDemographics = z.infer<typeof PatientDemographicsSchema>;
export type MrpToolData = z.infer<typeof MrpToolDataSchema>;
export type PatientInfo = z.infer<typeof PatientInfoSchema>;

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

export const StudentDrpAnswerSchema = z.object({
	name: z.string(),
	isPriority: z.boolean(),
	identification: optString,
	explanation: optString,
	planRecommendation: optString,
	monitoring: optString,
});

export type StudentDrpAnswer = z.infer<typeof StudentDrpAnswerSchema>;

export const StudentSubmissionPayloadSchema = z.object({
	patientInfo: PatientInfoSchema,
	studentDrpAnswers: z
		.array(StudentDrpAnswerSchema)
		.nullable()
		.optional()
		.transform((v) => v ?? []),
});

export type StudentSubmissionPayload = z.infer<typeof StudentSubmissionPayloadSchema>;

export const MrpFormDataSchema = z.object({
	guidanceText: z.string().default(""),
	reflectionQuestions: z.record(z.string(), z.string()).default({}),
});

export type MrpFormData = z.infer<typeof MrpFormDataSchema>;

export type StudentSubmissionQuery = {
	weeklyWorkupId: number;
	studentEnrollmentId: string; // UUID
};

/**
 * Outgoing JSON helper:
 * JSON.stringify drops undefined fields -> backend complains "missing".
 * Convert undefined -> null recursively so all keys are present.
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
