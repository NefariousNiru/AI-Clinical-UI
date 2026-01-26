// file: src/lib/docx/mrpQuestions.ts

import type { MrpQuestionsByStep } from "./types";
import { getStudentMrpFormData } from "../api/shared/student.ts";

export async function fetchMrpQuestionsByStep(steps: number[]): Promise<MrpQuestionsByStep> {
	const res = await Promise.allSettled(
		steps.map(async (step) => {
			const data = await getStudentMrpFormData(step);
			return { step, questions: data.reflectionQuestions ?? {} };
		}),
	);

	const out: MrpQuestionsByStep = {};
	for (const r of res) {
		if (r.status === "fulfilled") out[r.value.step] = r.value.questions;
	}
	return out;
}
