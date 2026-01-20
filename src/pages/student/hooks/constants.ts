// file: src/pages/student/hooks/constants.ts

import type { TextLimit } from "../forms/FormField.tsx";
import type {
	LabResult,
	MedicalHistory,
	MedicationList,
	MrpToolData,
	PatientDemographics,
	ProgressNotes,
	SocialHistory,
} from "../../../lib/types/studentSubmission.ts";
import type { WeeklyWorkupStudentStatus } from "../../../lib/types/studentWeeks.ts";

// ----------------- Weekly Workup Constants -----------------

export const STATUS_HELP: Array<{
	status: WeeklyWorkupStudentStatus;
	label: string;
	msg: string;
}> = [
	{ status: "locked", label: "Locked", msg: "Unlocks on scheduled start time." },
	{ status: "available", label: "Available", msg: "Open - you can start working." },
	{
		status: "in_progress",
		label: "In Progress",
		msg: "Continue where you left; Auto submits on deadline.",
	},
	{ status: "submitted", label: "Submitted", msg: "Edits allowed until deadline." },
	{ status: "grading", label: "Grading", msg: "Submission is being graded." },
	{ status: "not_submitted", label: "Not Submitted", msg: "Past due. Contact Admin/Instructor." },
	{ status: "feedback_available", label: "Feedback Available", msg: "View graded feedback." },
];

export const COURSE = "PHRM 5560: Integrated Patient Cases";

// ----------------- MRP Tool Constants ----------------------

export const totalSteps = 7;

export type MrpStepNo = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type MrpStepMeta = {
	step: MrpStepNo;
	shortTitle: string;
	longTitle: string;
};

export const MRP_STEPS: MrpStepMeta[] = [
	{ step: 1, shortTitle: "Orient", longTitle: "Orient Yourself to the Patient" },
	{
		step: 2,
		shortTitle: "Demographics",
		longTitle: "Review Patient Demographics and Social History",
	},
	{
		step: 3,
		shortTitle: "Problem List",
		longTitle: "Review Problem List and Medical History",
	},
	{ step: 4, shortTitle: "Medications", longTitle: "Review Medication List" },
	{ step: 5, shortTitle: "Labs", longTitle: "Review Labs Results" },
	{ step: 6, shortTitle: "Progress Notes", longTitle: "Review Progress Notes" },
	{ step: 7, shortTitle: "HCP List", longTitle: "Identify & Assess Health Care Problems" },
];

//-------------------------- Tabs --------------------------

export type TabKey = "patient" | "labs" | "meds" | "drp";

type TabItem = {
	value: TabKey;
	label: string;
};

export const STANDARD_TABS: TabItem[] = [
	{ value: "patient", label: "Patient Info" },
	{ value: "labs", label: "Labs & Progress" },
	{ value: "meds", label: "Medications" },
	{ value: "drp", label: "Health Care Problems" },
] as const;

// -------------------------- Forms -------------------------

type FieldSpec = {
	label: string;
	placeholder?: string;
	multiline?: boolean;
	limit?: TextLimit;
	maxChars?: number;
	showCounter?: boolean;
};

type FormFields<T> = {
	title: string;
	fields: Record<keyof T & string, FieldSpec>;
};

export const REFLECTION_ANSWER_FIELDS = {
	multiline: true,
	limit: "large",
	showCounter: true,
	placeholder: "Type your answer...",
};

export const MRP_TOOL_DATA_FIELDS: FormFields<MrpToolData> = {
	title: "Patient Orientation",
	fields: {
		patientScenario: {
			label: "Patient Scenario",
			multiline: true,
			limit: "medium",
			showCounter: true,
			placeholder: "Review the patient scenario...",
		},
		encounterSetting: {
			label: "Encounter Setting",
			multiline: true,
			limit: "medium",
			showCounter: true,
			placeholder: "e.g., Ambulatory clinic, Hospital inpatient, etc...",
		},
	},
};

export const SOCIAL_HISTORY_FIELDS: FormFields<SocialHistory> = {
	title: "Social History",
	fields: {
		occupation: {
			label: "Occupation / Occupation related notes",
			multiline: true,
			limit: "small",
			showCounter: true,
		},
		supportSystem: {
			label: "Support System",
			multiline: true,
			limit: "small",
			showCounter: true,
		},
		tobaccoUse: { label: "Tobacco Use", limit: "xSmall" },
		thcUse: { label: "THC Use", limit: "xSmall" },
		alcoholUse: { label: "Alcohol Use", limit: "xSmall" },
		cocaineUse: { label: "Cocaine Use", limit: "xSmall" },
		otherSubstanceUse: {
			label: "Other Substance Use",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
	},
};

export const PATIENT_DEMOGRAPHICS_FIELDS: FormFields<PatientDemographics> = {
	title: "Patient Demographics",
	fields: {
		name: { label: "Name", limit: "small" },
		ageDob: { label: "Age/Dob", limit: "xSmall" },
		sex: { label: "Sex", limit: "xSmall" },
		height: { label: "Height", limit: "xSmall", placeholder: "Specify units (cm, foot)" },
		weight: { label: "Weight", limit: "xSmall", placeholder: "Specify units (kg, lbs)" },
		bmi: { label: "BMI", limit: "xSmall" },
		admitVisitDate: { label: "Admit / Visit Date", limit: "xSmall" },
		insurance: { label: "Insurance", limit: "small" },
		vitalSigns: {
			label: "Vital Signs",
			multiline: true,
			limit: "small",
			showCounter: true,
			placeholder: "e.g., BP, HR, RR, Temp, O2 Sat (SpO2)...",
		},
		allergies: {
			label: "Allergies",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
	},
};

export const MEDICAL_HISTORY_FIELDS: FormFields<MedicalHistory> = {
	title: "Problem List & Medical History",
	fields: {
		problemList: {
			label: "Problem List",
			multiline: true,
			limit: "medium",
			showCounter: true,
			placeholder: "List all relevant current problems",
		},
		pastMedicalHistory: {
			label: "Medical History",
			multiline: true,
			limit: "medium",
			showCounter: true,
			placeholder: "List all relevant medical history",
		},
		familyHistory: {
			label: "Family History",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
	},
};

export const LAB_RESULT_FIELDS: FormFields<LabResult> = {
	title: "Lab Results",
	fields: {
		labsImagingMicrobiology: {
			label: "Labs / Imaging / Microbiology (Relevant / Normal)",
			multiline: true,
			limit: "medium",
			showCounter: true,
			placeholder: "Include all relevant lab values with reference ranges, dates, trends...",
		},
		renalFunctionAssessment: {
			label: "Renal Function Assessment",
			multiline: true,
			limit: "medium",
			showCounter: true,
			placeholder: "e.g., SCr (Serum Creatinine), eGFR, CrCl, assessment of renal function",
		},
	},
};

export const PROGRESS_NOTES_FIELDS: FormFields<ProgressNotes> = {
	title: "Progress Notes",
	fields: {
		chiefComplaint: {
			label: "Chief Complaint / Reason for Visit",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
		historyOfPresentIllness: {
			label: "History of Present Illness",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
		immunizations: {
			label: "Immunizations",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
		progressNotes: {
			label: "Progress Notes / Relevant Clinical Notes",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
		preliminaryProblemList: {
			label: "Preliminary Problem List / Relevant Notes",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
	},
};

export const MEDICATION_LIST_FIELDS: FormFields<MedicationList> = {
	title: "Medications & History",
	fields: {
		medications: {
			label: "Current Medications",
		},
		sup: { label: "SUP" },
		vtePpx: { label: "VTE DDX" },
		bowelRegimen: { label: "Bowel Regimen" },
		ivAccessLineTubes: {
			label: "If hospitalized, IV access, lines, tubes:",
			multiline: true,
			limit: "small",
			showCounter: true,
		},
		otcCam: {
			label: "OTC / CAM (Over the counter / Complementary Alternative Medicine)",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
		medicationAdherence: {
			label: "Medication Adherence / Refill History",
			multiline: true,
			limit: "medium",
			showCounter: true,
		},
	},
};
