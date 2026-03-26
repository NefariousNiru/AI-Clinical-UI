// file: src/pages/student/hooks/downloadDocx.ts

import type { DownloadDocxArgs } from "../../../lib/docx/types";
import { buildDocBlocks } from "../../../lib/docx/buildDocData";
import { generateDocxBytes } from "../../../lib/docx/generateDocx";
import { fetchMrpQuestionsByStep } from "../../../lib/docx/mrpQuestions";

function sanitizeFilePart(s: string): string {
	return (s ?? "")
		.trim()
		.replaceAll(/[<>:"/\\|?*\x00-\x1F]/g, "_")
		.slice(0, 80);
}

function defaultFileName(args: DownloadDocxArgs): string {
	const course = sanitizeFilePart(args.cover.course);
	const weekNo = sanitizeFilePart(args.cover.weekNo);
	const student = sanitizeFilePart(args.cover.studentName || "Student");
	return `${course}_Week${weekNo}_${student}.docx`;
}

function downloadBlob(blob: Blob, fileName: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

export async function downloadDocx(args: DownloadDocxArgs): Promise<void> {
	// Only when MRP is ON. Steps 1-6 only. No step 7.
	const mrp = args.isMrp ? await fetchMrpQuestionsByStep([1, 2, 3, 4, 5, 6]) : undefined;

	const { sections, medications, medicationScheduleLabels, medicationSectionTitle, drps } =
		buildDocBlocks({
			payload: args.payload,
			isMrp: args.isMrp,
			mrp,
		});

	const blob = await generateDocxBytes({
		cover: args.cover,
		sections,
		medications,
		medicationScheduleLabels,
		medicationSectionTitle,
		drps,
	});

	downloadBlob(blob, args.fileName ?? defaultFileName(args));
}
