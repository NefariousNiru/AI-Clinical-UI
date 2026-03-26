// file: src/lib/docx/generateDocx.ts

import {
	AlignmentType,
	Document,
	HeadingLevel,
	Packer,
	PageBreak,
	Paragraph,
	Table,
	TableCell,
	TableRow,
	TextRun,
	WidthType,
} from "docx";
import { titleizeDiseaseName } from "../utils/functions.ts";

function h2(text: string) {
	return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { after: 120 } });
}

function h3(text: string) {
	return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { after: 80 } });
}

function blankLine() {
	return new Paragraph({ children: [new TextRun("")], spacing: { after: 120 } });
}

function body(text: string) {
	return new Paragraph({ children: [new TextRun(text || "")], spacing: { after: 80 } });
}

function bodyBold(text: string) {
	return new Paragraph({
		children: [new TextRun({ text: text || "", bold: true })],
		spacing: { after: 80 },
	});
}

function coverTitle(text: string) {
	return new Paragraph({
		alignment: AlignmentType.CENTER,
		spacing: { after: 240 },
		children: [
			new TextRun({ text, bold: true, size: 44 }), // 22pt (size is half-points)
		],
	});
}

function coverSubtitle(text: string) {
	return new Paragraph({
		alignment: AlignmentType.CENTER,
		spacing: { after: 360 },
		children: [new TextRun({ text, size: 28 })], // 14pt
	});
}

function infoLine(label: string, value: string) {
	return new Paragraph({
		alignment: AlignmentType.LEFT,
		spacing: { after: 160 },
		children: [
			new TextRun({ text: `${label}: `, bold: true, size: 24 }), // 12pt
			new TextRun({ text: value || "", size: 24 }),
		],
	});
}

function kvTable(rows: Array<{ label: string; value: string }>) {
	const tableRows: TableRow[] = rows.map(
		(r) =>
			new TableRow({
				children: [
					new TableCell({
						width: { size: 32, type: WidthType.PERCENTAGE },
						children: [body(r.label)],
					}),
					new TableCell({
						width: { size: 68, type: WidthType.PERCENTAGE },
						children: [body(r.value)],
					}),
				],
			}),
	);

	return new Table({
		width: { size: 100, type: WidthType.PERCENTAGE },
		rows: [
			new TableRow({
				children: [
					new TableCell({ children: [bodyBold("Field")] }),
					new TableCell({ children: [bodyBold("Student Response")] }),
				],
			}),
			...tableRows,
		],
	});
}

function medsTable(args: {
	meds: Array<{ scheduledStartStopDate: string; prn: string }>;
	labels: { scheduledStartStopDate: string; prn: string };
}) {
	const bodyRows = args.meds.length ? args.meds : [{ scheduledStartStopDate: "", prn: "" }];

	return new Table({
		width: { size: 100, type: WidthType.PERCENTAGE },
		rows: [
			new TableRow({
				children: [
					new TableCell({ children: [body(args.labels.scheduledStartStopDate)] }),
					new TableCell({ children: [body(args.labels.prn)] }),
				],
			}),
			...bodyRows.map(
				(m) =>
					new TableRow({
						children: [
							new TableCell({ children: [body(m.scheduledStartStopDate)] }),
							new TableCell({ children: [body(m.prn)] }),
						],
					}),
			),
		],
	});
}

export async function generateDocxBytes(args: {
	cover: {
		course: string;
		studentName: string;
		studentEmail: string;
		weekNo: string;
		patientName: string;
	};
	sections: Array<{
		title: string;
		rows: Array<{ label: string; value: string }>;
		reflection?: Array<{ label: string; value: string }>;
	}>;
	medications: Array<{ scheduledStartStopDate: string; prn: string }>;
	medicationScheduleLabels: { scheduledStartStopDate: string; prn: string };
	medicationSectionTitle: string;
	drps: Array<{
		name: string;
		isPriority: string;
		identification: string;
		explanation: string;
		planRecommendation: string;
		monitoring: string;
	}>;
}) {
	const children: any[] = [];

	// Cover
	children.push(
		coverTitle("Student Clinical Workup"),
		coverSubtitle(`${args.cover.course} - Week ${args.cover.weekNo}`),
		infoLine("Student", args.cover.studentName),
		infoLine("Email", args.cover.studentEmail),
		infoLine("Patient", args.cover.patientName),
		new Paragraph({ children: [new PageBreak()] }),
	);

	// Main sections
	for (const s of args.sections) {
		children.push(h2(s.title));
		children.push(kvTable(s.rows));
		children.push(new Paragraph({ spacing: { after: 200 } }));

		// Medication schedule table right after Medication section
		if (s.title === args.medicationSectionTitle) {
			children.push(h3("Medication Schedule"));
			children.push(
				medsTable({
					meds: args.medications,
					labels: args.medicationScheduleLabels,
				}),
			);
			children.push(new Paragraph({ spacing: { after: 200 } }));
		}

		// Reflection QnA as separate table
		if (s.reflection && s.reflection.length > 0) {
			children.push(h3("Reflection QnA"));
			children.push(kvTable(s.reflection));
			children.push(new Paragraph({ spacing: { after: 200 } }));
		}
	}

	// DRPs are a main section
	children.push(new Paragraph({ children: [new PageBreak()] }));
	children.push(
		new Paragraph({ text: "Drug-Related Problems", heading: HeadingLevel.HEADING_1 }),
	);
	children.push(blankLine());

	let i = 0;
	for (const drp of args.drps) {
		i += 1;
		const problemTitle = titleizeDiseaseName(drp.name || "");
		children.push(
			new Paragraph({ text: problemTitle || "Problem", heading: HeadingLevel.HEADING_2 }),
		);

		// spacing: one line after DRP title
		children.push(blankLine());

		children.push(h3("Priority"));
		children.push(body(drp.isPriority));

		children.push(h3("Identification"));
		children.push(body(drp.identification));

		children.push(h3("Explanation"));
		children.push(body(drp.explanation));

		children.push(h3("Plan / Recommendation"));
		children.push(body(drp.planRecommendation));

		children.push(h3("Monitoring"));
		children.push(body(drp.monitoring));

		if (i < args.drps.length) children.push(new Paragraph({ children: [new PageBreak()] }));
	}

	const doc = new Document({ sections: [{ children }] });
	return Packer.toBlob(doc);
}
