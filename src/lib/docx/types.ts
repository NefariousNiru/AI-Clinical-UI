// file: src/lib/docx/types.ts

import type { StudentSubmissionPayload } from "../types/studentSubmission";

export type DownloadDocxArgs = {
	payload: StudentSubmissionPayload;
	isMrp: boolean;
	cover: {
		course: string;
		studentName: string;
		studentEmail: string;
		weekNo: string;
		patientName: string;
	};
	/**
	 * Kept for compatibility, but current rules always display all labels regardless of value.
	 */
	showEmptyLabels?: boolean;
	fileName?: string;
};

export type MrpQuestionsByStep = Record<number, Record<string, string>>;

export type DocRow = { label: string; value: string };

export type DocSection = {
	title: string;
	rows: DocRow[];
	/**
	 * Only present when isMrp === true for that section.
	 */
	reflection?: DocRow[];
};
