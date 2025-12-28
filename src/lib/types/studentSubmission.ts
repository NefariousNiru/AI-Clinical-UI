// file: src/lib/types/studentSubmission.ts

import {z} from "zod";

/**
 * PatientInfo
 */

const ReflectionAnswersSchema = z.record(z.string(), z.string()).optional();

export const ProgressNotesSchema = z.object({
    chiefComplaint: z.string().optional(),
    historyOfPresentIllness: z.string().optional(),
    immunizations: z.string().optional(),
    progressNotes: z.string().optional(),
    preliminaryProblemList: z.string().optional(),
    reflectionAnswers: ReflectionAnswersSchema,
});

export const LabResultSchema = z.object({
    labsImagingMicrobiology: z.string().optional(),
    renalFunctionAssessment: z.string().optional(),
    reflectionAnswers: ReflectionAnswersSchema,
});

export const MedicationHistorySchema = z.object({
    scheduledStartStopDate: z.string().optional(),
    prn: z.string().optional(),
});

export const MedicationListSchema = z.object({
    medications: z.array(MedicationHistorySchema).default([]),
    sup: z.boolean().optional(),
    vtePpx: z.boolean().optional(),
    bowelRegimen: z.boolean().optional(),
    ivAccessLineTubes: z.string().optional(),
    otcCam: z.string().optional(),
    medicationAdherence: z.string().optional(),
    reflectionAnswers: ReflectionAnswersSchema,
});

export const MedicalHistorySchema = z.object({
    problemList: z.string().optional(),
    pastMedicalHistory: z.string().optional(),
    familyHistory: z.string().optional(),
    reflectionAnswers: ReflectionAnswersSchema,
});

export const SocialHistorySchema = z.object({
    occupation: z.string().optional(),
    supportSystem: z.string().optional(),
    tobaccoUse: z.string().optional(),
    thcUse: z.string().optional(),
    alcoholUse: z.string().optional(),
    cocaineUse: z.string().optional(),
    otherSubstanceUse: z.string().optional(),
});

export const PatientDemographicsSchema = z.object({
    name: z.string().optional(),
    ageDob: z.string().optional(),
    sex: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    bmi: z.string().optional(),
    admitVisitDate: z.string().optional(),
    insurance: z.string().optional(),
    vitalSigns: z.string().optional(),
    allergies: z.string().optional(),
    reflectionAnswers: ReflectionAnswersSchema,
});

export const MrpToolDataSchema = z.object({
    patientScenario: z.string().optional(),
    encounterSetting: z.string().optional(),
    reflectionAnswers: ReflectionAnswersSchema,
});

export const PatientInfoSchema = z.object({
    mrpToolData: MrpToolDataSchema.optional(),
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
        mrpToolData: undefined,
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
    identification: z.string().optional(),
    explanation: z.string().optional(),
    planRecommendation: z.string().optional(),
    monitoring: z.string().optional(),
});

export type StudentDrpAnswer = z.infer<typeof StudentDrpAnswerSchema>;

export const StudentSubmissionPayloadSchema = z.object({
    patientInfo: PatientInfoSchema,
    studentDrpAnswers: z.array(StudentDrpAnswerSchema).default([]),
});

export type StudentSubmissionPayload = z.infer<typeof StudentSubmissionPayloadSchema>;

export const MrpFormDataSchema = z.object({
    guidanceText: z.string().default(""),
    reflectionQuestions: z.record(z.string(), z.string()).default({}),
});

export type MrpFormData = z.infer<typeof MrpFormDataSchema>;


/**
 * Query params required by submission endpoints.
 * Move this type to types, not API file.
 */
export type StudentSubmissionQuery = {
    weeklyWorkupId: number;
    studentEnrollmentId: string; // UUID
};