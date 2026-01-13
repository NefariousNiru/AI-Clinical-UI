// file: src/pages/student/hooks/downloadDocx.ts

import { Document, Packer, PageBreak, Paragraph, TextRun } from "docx";
import {
	LAB_RESULT_FIELDS,
	MEDICAL_HISTORY_FIELDS,
	MEDICATION_LIST_FIELDS,
	MRP_TOOL_DATA_FIELDS,
	PATIENT_DEMOGRAPHICS_FIELDS,
	PROGRESS_NOTES_FIELDS,
	SOCIAL_HISTORY_FIELDS,
} from "./constants";
import { getStudentMrpFormData } from "../../../lib/api/shared/student.ts";
import type {
	MedicationHistory,
	MrpFormData,
	StudentSubmissionPayload,
} from "../../../lib/types/studentSubmission.ts";
import { titleizeDiseaseName } from "../../../lib/utils/functions.ts";

type ReflectionQuestionsByStep = Record<number, Record<string, string>>;

type CoverMeta = {
	course: string; // "PHRM 5560: Integrated Patient Cases"
	studentName: string;
	studentEmail: string;
	weekNo: number | string;
	patientName: string;
};

function pt(n: number): number {
	// docx uses half-points
	return n * 2;
}

function safeStr(v: unknown): string {
	if (v == null) return "";
	if (typeof v === "string") return v;
	if (typeof v === "boolean") return v ? "Yes" : "No";
	if (typeof v === "number") return String(v);
	return String(v);
}

function labelValuePara(label: string, value: string): Paragraph {
	return new Paragraph({
		children: [
			new TextRun({ text: `${label}: `, bold: true, font: "Times New Roman", size: pt(11) }),
			new TextRun({ text: value, font: "Times New Roman", size: pt(11) }),
		],
		spacing: { after: 120 },
	});
}

function headingPara(title: string): Paragraph {
	return new Paragraph({
		children: [new TextRun({ text: title, bold: true, font: "Times New Roman", size: pt(13) })],
		spacing: { before: 240, after: 160 },
	});
}

function coverPara(text: string, sizePt = 12, bold = false): Paragraph {
	return new Paragraph({
		children: [new TextRun({ text, bold, font: "Times New Roman", size: pt(sizePt) })],
		spacing: { after: 140 },
	});
}

function nowNyParts(): { date: string; time24: string } {
	const dt = new Date();

	// Force America/New_York formatting independent of browser locale.
	const dateFmt = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/New_York",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const timeFmt = new Intl.DateTimeFormat("en-GB", {
		timeZone: "America/New_York",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	const date = dateFmt.format(dt); // YYYY-MM-DD in en-CA
	const time = timeFmt.format(dt).replace(":", ""); // HHmm
	return { date, time24: time };
}

function sanitizeForFilename(s: string): string {
	return s
		.trim()
		.replace(/\s+/g, "_")
		.replace(/[^a-zA-Z0-9._-]/g, "");
}

async function fetchReflectionQuestionsAllSteps(): Promise<ReflectionQuestionsByStep> {
	const steps = [1, 2, 3, 4, 5, 6] as const;
	const res = await Promise.allSettled(
		steps.map(async (s) => ({
			step: s,
			data: (await getStudentMrpFormData(s)) as MrpFormData,
		})),
	);

	const out: ReflectionQuestionsByStep = {};
	for (const r of res) {
		if (r.status !== "fulfilled") continue;
		out[r.value.step] = r.value.data.reflectionQuestions ?? {};
	}
	return out;
}

function renderReflectionBlock(
	stepNo: number,
	reflectionAnswers: Record<string, string> | undefined,
	questionsByStep: ReflectionQuestionsByStep,
): Paragraph[] {
	const answers = reflectionAnswers ?? {};
	const keys = Object.keys(answers).sort();
	if (keys.length === 0) {
		// Still include the Reflection Questions heading and leave it empty? You said all fields mentioned.
		// So we print the heading and nothing else.
		return [labelValuePara("Reflection Questions", "")];
	}

	const qs = questionsByStep[stepNo] ?? {};
	const paras: Paragraph[] = [];
	paras.push(labelValuePara("Reflection Questions", ""));

	for (const k of keys) {
		const q = qs[k];
		const label = q ? `${k}. ${q}` : `${k}`;
		const a = answers[k] ?? "";
		paras.push(labelValuePara(label, a));
	}
	return paras;
}

function renderMedicationList(meds: MedicationHistory[] | undefined): Paragraph[] {
	const ms = meds ?? [];
	if (ms.length === 0) return [labelValuePara("Current Medications", "")];

	const out: Paragraph[] = [];
	for (let i = 0; i < ms.length; i++) {
		const m = ms[i] ?? {};
		const idx = i + 1;
		out.push(
			labelValuePara(
				`Medication ${idx} - Drug & Schedule (Start / Stop) Date`,
				safeStr(m.scheduledStartStopDate),
			),
		);
		out.push(labelValuePara(`Medication ${idx} - PRNs (received doses)`, safeStr(m.prn)));
	}
	return out;
}

export async function downloadMrpDocx(opts: {
	isMrp: boolean;
	payload: StudentSubmissionPayload;
	cover: CoverMeta;
}): Promise<void> {
	const { payload, cover } = opts;

	const questionsByStep = await fetchReflectionQuestionsAllSteps();

	const p = payload.patientInfo;

	const docChildren: Paragraph[] = [];

	// Cover page
	docChildren.push(coverPara("University of Georgia", 16, true));
	docChildren.push(coverPara(cover.course, 12, true));
	docChildren.push(coverPara(""));
	docChildren.push(coverPara(`Student Name: ${cover.studentName}`, 12, false));
	docChildren.push(coverPara(`Student Email: ${cover.studentEmail}`, 12, false));
	docChildren.push(coverPara(`Week No: ${safeStr(cover.weekNo)}`, 12, false));
	docChildren.push(coverPara(`Patient Name: ${cover.patientName}`, 12, false));

	docChildren.push(new Paragraph({ children: [new PageBreak()] }));

	// Section 1 - Patient Orientation (step 1)
	{
		docChildren.push(headingPara(MRP_TOOL_DATA_FIELDS.title));
		const v = p.mrpToolData ?? {
			patientScenario: undefined,
			encounterSetting: undefined,
			reflectionAnswers: undefined,
		};
		docChildren.push(
			labelValuePara(
				MRP_TOOL_DATA_FIELDS.fields.patientScenario.label ?? "patientScenario",
				safeStr(v.patientScenario),
			),
		);
		docChildren.push(
			labelValuePara(
				MRP_TOOL_DATA_FIELDS.fields.encounterSetting.label ?? "encounterSetting",
				safeStr(v.encounterSetting),
			),
		);
		docChildren.push(...renderReflectionBlock(1, v.reflectionAnswers, questionsByStep));
	}

	// Section 2a - Patient Demographics (step 2 reflection)
	{
		docChildren.push(headingPara(PATIENT_DEMOGRAPHICS_FIELDS.title));
		const v = p.patientDemographics;
		const f = PATIENT_DEMOGRAPHICS_FIELDS.fields;

		// Render all non-reflection fields explicitly in the insertion order you declared.
		for (const key of Object.keys(f)) {
			if (key === "reflectionAnswers") continue;
			const spec = f[key as keyof typeof f];
			const label = spec.label ?? key;
			docChildren.push(labelValuePara(label, safeStr((v as any)[key])));
		}

		docChildren.push(...renderReflectionBlock(2, v.reflectionAnswers, questionsByStep));
	}

	// Section 2b - Social History (no reflection schema)
	{
		docChildren.push(headingPara(SOCIAL_HISTORY_FIELDS.title));
		const v = p.socialHistory;
		const f = SOCIAL_HISTORY_FIELDS.fields;

		for (const key of Object.keys(f)) {
			const spec = f[key as keyof typeof f];
			const label = spec.label ?? key;
			docChildren.push(labelValuePara(label, safeStr((v as any)[key])));
		}
	}

	// Section 3 - Medical History (step 3 reflection)
	{
		docChildren.push(headingPara(MEDICAL_HISTORY_FIELDS.title));
		const v = p.medicalHistory;
		const f = MEDICAL_HISTORY_FIELDS.fields;

		for (const key of Object.keys(f)) {
			if (key === "reflectionAnswers") continue;
			const spec = f[key as keyof typeof f];
			const label = spec.label ?? key;
			docChildren.push(labelValuePara(label, safeStr((v as any)[key])));
		}

		docChildren.push(...renderReflectionBlock(3, v.reflectionAnswers, questionsByStep));
	}

	// Section 4 - Medication List (step 4 reflection)
	{
		docChildren.push(headingPara(MEDICATION_LIST_FIELDS.title));
		const v = p.medicationList;

		// Medications array (flattened label/value)
		docChildren.push(...renderMedicationList(v.medications));

		// Booleans and text fields
		const f = MEDICATION_LIST_FIELDS.fields;
		docChildren.push(labelValuePara(f.sup.label ?? "sup", safeStr(v.sup)));
		docChildren.push(labelValuePara(f.vtePpx.label ?? "vtePpx", safeStr(v.vtePpx)));
		docChildren.push(
			labelValuePara(f.bowelRegimen.label ?? "bowelRegimen", safeStr(v.bowelRegimen)),
		);
		docChildren.push(
			labelValuePara(
				f.ivAccessLineTubes.label ?? "ivAccessLineTubes",
				safeStr(v.ivAccessLineTubes),
			),
		);
		docChildren.push(labelValuePara(f.otcCam.label ?? "otcCam", safeStr(v.otcCam)));
		docChildren.push(
			labelValuePara(
				f.medicationAdherence.label ?? "medicationAdherence",
				safeStr(v.medicationAdherence),
			),
		);

		docChildren.push(...renderReflectionBlock(4, v.reflectionAnswers, questionsByStep));
	}

	// Section 5 - Lab Results (step 5 reflection)
	{
		docChildren.push(headingPara(LAB_RESULT_FIELDS.title));
		const v = p.labResult;
		const f = LAB_RESULT_FIELDS.fields;

		for (const key of Object.keys(f)) {
			if (key === "reflectionAnswers") continue;
			const spec = f[key as keyof typeof f];
			const label = spec.label ?? key;
			docChildren.push(labelValuePara(label, safeStr((v as any)[key])));
		}

		docChildren.push(...renderReflectionBlock(5, v.reflectionAnswers, questionsByStep));
	}

	// Section 6 - Progress Notes (step 6 reflection)
	{
		docChildren.push(headingPara(PROGRESS_NOTES_FIELDS.title));
		const v = p.progressNotes;
		const f = PROGRESS_NOTES_FIELDS.fields;

		for (const key of Object.keys(f)) {
			if (key === "reflectionAnswers") continue;
			const spec = f[key as keyof typeof f];
			const label = spec.label ?? key;
			docChildren.push(labelValuePara(label, safeStr((v as any)[key])));
		}

		docChildren.push(...renderReflectionBlock(6, v.reflectionAnswers, questionsByStep));
	}

	// Step 7 HCP list
	{
		docChildren.push(headingPara("HCP List"));
		const list = payload.studentDrpAnswers ?? [];
		if (list.length === 0) {
			docChildren.push(labelValuePara("HCP Entries", ""));
		} else {
			for (let i = 0; i < list.length; i++) {
				const a = list[i];
				const n = i + 1;
				docChildren.push(
					labelValuePara(`HCP ${n} - Name`, titleizeDiseaseName(safeStr(a.name))),
				);
				docChildren.push(
					labelValuePara(`HCP ${n} - Priority`, a.isPriority ? "Yes" : "No"),
				);
				docChildren.push(
					labelValuePara(`HCP ${n} - Identification`, safeStr(a.identification)),
				);
				docChildren.push(labelValuePara(`HCP ${n} - Explanation`, safeStr(a.explanation)));
				docChildren.push(
					labelValuePara(
						`HCP ${n} - Plan / Recommendation`,
						safeStr(a.planRecommendation),
					),
				);
				docChildren.push(labelValuePara(`HCP ${n} - Monitoring`, safeStr(a.monitoring)));
			}
		}
	}

	const doc = new Document({
		sections: [{ children: docChildren }],
	});

	const blob = await Packer.toBlob(doc);

	// Filename
	const { date, time24 } = nowNyParts();
	const student = sanitizeForFilename(cover.studentName);
	const filename = `${student}_${date}_${time24}.docx`;

	const url = URL.createObjectURL(blob);
	try {
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
	} finally {
		URL.revokeObjectURL(url);
	}
}
