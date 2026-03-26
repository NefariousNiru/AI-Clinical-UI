// file: src/lib/docx/buildBlocks.ts

import type { StudentSubmissionPayload } from "../types/studentSubmission";
import type { DocRow, DocSection, MrpQuestionsByStep } from "./types";

import {
	LAB_RESULT_FIELDS,
	MEDICAL_HISTORY_FIELDS,
	MEDICATION_HISTORY_FIELDS,
	MEDICATION_LIST_FIELDS,
	MRP_TOOL_DATA_FIELDS,
	PATIENT_DEMOGRAPHICS_FIELDS,
	PROGRESS_NOTES_FIELDS,
	SOCIAL_HISTORY_FIELDS,
} from "../../pages/student/hooks/constants";
import { numericKeySort } from "../../pages/shared/hooks/useReflectionQuestions.ts"; // adjust if needed

function toStr(v: unknown): string {
	if (v == null) return "";
	if (typeof v === "boolean") return v ? "Yes" : "No";
	return String(v);
}

/**
 * Rule: always include all labels regardless of value.
 */
function rowsFromFields<T extends Record<string, any>>(
	fields: { fields: Record<string, { label: string }> },
	data: Partial<T> | undefined,
	excludeKeys?: string[],
): DocRow[] {
	const ex = new Set(excludeKeys ?? []);
	const out: DocRow[] = [];

	for (const [key, spec] of Object.entries(fields.fields)) {
		if (ex.has(key)) continue;
		out.push({ label: spec.label ?? "", value: toStr((data as any)?.[key]) });
	}
	return out;
}

/**
 * Reflection QnA:
 * - only included when isMrp is true (controlled by caller)
 * - always show questions (answer can be empty)
 * - include any answer keys not present in questions
 */
function reflectionRows(args: {
	answers?: Record<string, string>;
	questions?: Record<string, string>;
}): DocRow[] {
	const answers = args.answers ?? {};
	const questions = args.questions ?? {};

	const keys = Array.from(new Set([...Object.keys(questions), ...Object.keys(answers)])).sort(
		numericKeySort,
	);

	return keys.map((k) => {
		const q = (questions[k] ?? "").trim();
		return {
			label: q ? `Q${k}. ${q}` : `Q${k}`,
			value: toStr(answers[k] ?? ""),
		};
	});
}

export function buildDocBlocks(args: {
	payload: StudentSubmissionPayload;
	isMrp: boolean;
	mrp?: MrpQuestionsByStep; // steps 1-6
}) {
	const { payload, isMrp } = args;
	const mrp = args.mrp ?? {};
	const p = payload.patientInfo;

	const sections: DocSection[] = [];

	// Patient Orientation - only when MRP is ON
	if (isMrp) {
		sections.push({
			title: MRP_TOOL_DATA_FIELDS.title,
			rows: rowsFromFields(MRP_TOOL_DATA_FIELDS as any, p.mrpToolData),
			reflection: reflectionRows({
				answers: p.mrpToolData?.reflectionAnswers,
				questions: mrp[1],
			}),
		});
	}

	sections.push({
		title: PATIENT_DEMOGRAPHICS_FIELDS.title,
		rows: rowsFromFields(PATIENT_DEMOGRAPHICS_FIELDS as any, p.patientDemographics),
		reflection: isMrp
			? reflectionRows({
					answers: p.patientDemographics?.reflectionAnswers,
					questions: mrp[2],
				})
			: undefined,
	});

	sections.push({
		title: SOCIAL_HISTORY_FIELDS.title,
		rows: rowsFromFields(SOCIAL_HISTORY_FIELDS as any, p.socialHistory),
	});

	sections.push({
		title: MEDICAL_HISTORY_FIELDS.title,
		rows: rowsFromFields(MEDICAL_HISTORY_FIELDS as any, p.medicalHistory),
		reflection: isMrp
			? reflectionRows({
					answers: p.medicalHistory?.reflectionAnswers,
					questions: mrp[3],
				})
			: undefined,
	});

	sections.push({
		title: MEDICATION_LIST_FIELDS.title,
		rows: rowsFromFields(MEDICATION_LIST_FIELDS as any, p.medicationList, ["medications"]),
		reflection: isMrp
			? reflectionRows({
					answers: p.medicationList?.reflectionAnswers,
					questions: mrp[4],
				})
			: undefined,
	});

	sections.push({
		title: LAB_RESULT_FIELDS.title,
		rows: rowsFromFields(LAB_RESULT_FIELDS as any, p.labResult),
		reflection: isMrp
			? reflectionRows({
					answers: p.labResult?.reflectionAnswers,
					questions: mrp[5],
				})
			: undefined,
	});

	sections.push({
		title: PROGRESS_NOTES_FIELDS.title,
		rows: rowsFromFields(PROGRESS_NOTES_FIELDS as any, p.progressNotes),
		reflection: isMrp
			? reflectionRows({
					answers: p.progressNotes?.reflectionAnswers,
					questions: mrp[6],
				})
			: undefined,
	});

	// Medication rows - keep at least one blank row so the table prints
	const medications = (p.medicationList?.medications ?? []).map((m) => ({
		scheduledStartStopDate: toStr(m.scheduledStartStopDate),
		prn: toStr(m.prn),
	}));

	const drps = (payload.studentDrpAnswers ?? []).map((d) => ({
		name: toStr(d.name),
		isPriority: d.isPriority ? "Yes" : "No",
		identification: toStr(d.identification),
		explanation: toStr(d.explanation),
		planRecommendation: toStr(d.planRecommendation),
		monitoring: toStr(d.monitoring),
	}));

	return {
		sections,
		medications,
		medicationScheduleLabels: {
			scheduledStartStopDate: MEDICATION_HISTORY_FIELDS.fields.scheduledStartStopDate.label,
			prn: MEDICATION_HISTORY_FIELDS.fields.prn.label,
		},
		medicationSectionTitle: MEDICATION_LIST_FIELDS.title,
		drps,
	};
}
