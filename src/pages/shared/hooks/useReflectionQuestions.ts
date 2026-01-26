// file: src/pages/shared/hooks/useReflectionQuestions.ts

import { useEffect, useMemo, useState } from "react";
import { getStudentMrpFormData } from "../../../lib/api/shared/student.ts";

type QuestionMap = Record<string, string>;

export function numericKeySort(a: string, b: string): number {
	const na = Number(a);
	const nb = Number(b);
	const aNum = !Number.isNaN(na);
	const bNum = !Number.isNaN(nb);

	if (aNum && bNum) return na - nb;
	if (aNum) return -1;
	if (bNum) return 1;
	return a.localeCompare(b);
}

export function useReflectionQuestions(step: number) {
	const [questions, setQuestions] = useState<QuestionMap>({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let alive = true;

		async function run() {
			setLoading(true);
			try {
				const data = await getStudentMrpFormData(step);
				if (!alive) return;
				setQuestions(data.reflectionQuestions ?? {});
			} catch {
				if (!alive) return;
				setQuestions({});
			} finally {
				if (alive) setLoading(false);
			}
		}

		run();
		return () => {
			alive = false;
		};
	}, [step]);

	const orderedQuestionKeys = useMemo(() => {
		return Object.keys(questions).sort(numericKeySort);
	}, [questions]);

	return { questions, orderedQuestionKeys, loading };
}
