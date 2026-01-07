// file: src/pages/student/hooks/mrpTool.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	makeEmptyPatientInfo,
	type MrpFormData,
	type StudentDrpAnswer,
	type StudentSubmissionPayload,
	type StudentSubmissionQuery,
} from "../../../lib/types/studentSubmission";
import { usePatientInfoForm } from "./forms";
import {
	getStudentMrpFormData,
	getStudentSubmission,
	saveStudentSubmission,
} from "../../../lib/api/shared/student.ts";
import { MRP_STEPS, type MrpStepNo } from "./constants.ts";
import { fillPatientInfoShape, undefinedToNullDeep } from "./payloadShape.ts";

function normalizeDrp(items: StudentDrpAnswer[]): Array<{
	name: string;
	isPriority: boolean;
	identification: string;
	explanation: string;
	planRecommendation: string;
	monitoring: string;
}> {
	// 1) drop invalid/draft cards (no disease selected)
	const cleaned = (items ?? []).filter((x) => (x?.name ?? "").trim().length > 0);

	// 2) enforce "only one priority" deterministically
	let prioritySeen = false;

	return cleaned.map((x) => {
		const wantsPriority = Boolean(x.isPriority);
		const isPriority = wantsPriority && !prioritySeen;
		if (isPriority) prioritySeen = true;

		return {
			name: (x.name ?? "").trim(),
			isPriority,
			// backend model usually wants these present (non-Optional)
			identification: (x.identification ?? "").trim(),
			explanation: (x.explanation ?? "").trim(),
			planRecommendation: (x.planRecommendation ?? "").trim(),
			monitoring: (x.monitoring ?? "").trim(),
		};
	});
}

function stableStringify(value: unknown): string {
	const seen = new WeakSet<object>();

	const normalize = (v: any): any => {
		if (v === null || v === undefined) return v;
		if (typeof v !== "object") return v;
		if (Array.isArray(v)) return v.map(normalize);

		if (seen.has(v)) return "[Circular]";
		seen.add(v);

		const keys = Object.keys(v).sort();
		const out: Record<string, any> = {};
		for (const k of keys) out[k] = normalize(v[k]);
		return out;
	};

	return JSON.stringify(normalize(value));
}

function hasAnyMeaningfulValue(v: unknown): boolean {
	if (v == null) return false;
	if (typeof v === "string") return v.trim().length > 0;
	if (typeof v === "boolean") return true;
	if (typeof v === "number") return true;
	if (Array.isArray(v)) return v.some(hasAnyMeaningfulValue);
	if (typeof v === "object") return Object.values(v as any).some(hasAnyMeaningfulValue);
	return false;
}

type ReflectionMap = Record<string, string>;

export function useMrpTool(q: StudentSubmissionQuery) {
	const [step, setStep] = useState<MrpStepNo>(1);

	// patientInfo managed by your existing hook
	const patient = usePatientInfoForm(makeEmptyPatientInfo());
	const [studentDrpAnswers, setStudentDrpAnswers] = useState<StudentDrpAnswer[]>([]);

	// per-step guidance + questions
	const [mrpFormData, setMrpFormData] = useState<MrpFormData>({
		guidanceText: "",
		reflectionQuestions: {},
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// dirty detection
	const lastSavedSnapshotRef = useRef<string>("");

	const payload: StudentSubmissionPayload = useMemo(
		() => ({
			patientInfo: patient.patientInfo,
			studentDrpAnswers,
		}),
		[patient.patientInfo, studentDrpAnswers],
	);

	const currentSnapshot = useMemo(() => stableStringify(payload), [payload]);

	const isDirty = useMemo(() => {
		if (!lastSavedSnapshotRef.current) return false;
		return lastSavedSnapshotRef.current !== currentSnapshot;
	}, [currentSnapshot]);

	const meta = useMemo(() => MRP_STEPS.find((s) => s.step === step)!, [step]);

	const completedByStep = useMemo(() => {
		const p = patient.patientInfo;

		const completed: Record<MrpStepNo, boolean> = {
			1: hasAnyMeaningfulValue(p.mrpToolData),
			2:
				hasAnyMeaningfulValue(p.patientDemographics) ||
				hasAnyMeaningfulValue(p.socialHistory),
			3: hasAnyMeaningfulValue(p.medicalHistory),
			4: hasAnyMeaningfulValue(p.medicationList),
			5: hasAnyMeaningfulValue(p.labResult),
			6: hasAnyMeaningfulValue(p.progressNotes),
			7: studentDrpAnswers.length > 0,
		};

		return completed;
	}, [patient.patientInfo, studentDrpAnswers]);

	const completedCount = useMemo(() => {
		return Object.values(completedByStep).filter(Boolean).length;
	}, [completedByStep]);

	const maxUnlockedStep = useMemo<MrpStepNo>(() => {
		let unlocked: number = 1;
		for (let i = 1 as MrpStepNo; i <= 7; i = (i + 1) as MrpStepNo) {
			if (i === 7) break;
			if (completedByStep[i]) unlocked = i + 1;
			else break;
		}
		// unlocked is in [1..7]
		return Math.min(7, Math.max(1, unlocked)) as MrpStepNo;
	}, [completedByStep]);

	const canAdvanceFromCurrentStep = useMemo(() => {
		return completedByStep[step] === true;
	}, [completedByStep, step]);

	const getReflectionAnswersForStep = useCallback(
		(s: MrpStepNo): ReflectionMap => {
			const p = patient.patientInfo;
			switch (s) {
				case 1:
					return p.mrpToolData?.reflectionAnswers ?? {};
				case 2:
					return p.patientDemographics.reflectionAnswers ?? {};
				case 3:
					return p.medicalHistory.reflectionAnswers ?? {};
				case 4:
					return p.medicationList.reflectionAnswers ?? {};
				case 5:
					return p.labResult.reflectionAnswers ?? {};
				case 6:
					return p.progressNotes.reflectionAnswers ?? {};
				case 7:
					return {}; // typically empty or ignored
			}
		},
		[patient.patientInfo],
	);

	const setReflectionAnswerForStep = useCallback(
		(s: MrpStepNo, key: string, value: string) => {
			const v = value.trim();
			const nextVal = v.length === 0 ? undefined : v;

			const upsert = (m?: ReflectionMap): ReflectionMap | undefined => {
				const cur = m ?? {};
				const next: ReflectionMap = { ...cur };
				if (nextVal == null) delete next[key];
				else next[key] = nextVal;

				return Object.keys(next).length === 0 ? undefined : next;
			};

			const p = patient.patientInfo;

			switch (s) {
				case 1: {
					const cur = p.mrpToolData ?? {
						patientScenario: undefined,
						encounterSetting: undefined,
						reflectionAnswers: undefined,
					};
					patient.setMrpToolData({
						...cur,
						reflectionAnswers: upsert(cur.reflectionAnswers),
					});
					return;
				}
				case 2: {
					patient.setPatientDemographics({
						...p.patientDemographics,
						reflectionAnswers: upsert(p.patientDemographics.reflectionAnswers),
					});
					return;
				}
				case 3: {
					patient.setMedicalHistory({
						...p.medicalHistory,
						reflectionAnswers: upsert(p.medicalHistory.reflectionAnswers),
					});
					return;
				}
				case 4: {
					patient.setMedicationList({
						...p.medicationList,
						reflectionAnswers: upsert(p.medicationList.reflectionAnswers),
					});
					return;
				}
				case 5: {
					patient.setLabResult({
						...p.labResult,
						reflectionAnswers: upsert(p.labResult.reflectionAnswers),
					});
					return;
				}
				case 6: {
					patient.setProgressNotes({
						...p.progressNotes,
						reflectionAnswers: upsert(p.progressNotes.reflectionAnswers),
					});
					return;
				}
				case 7:
					return;
			}
		},
		[patient],
	);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [submission, form] = await Promise.all([
				getStudentSubmission(q),
				getStudentMrpFormData(step),
			]);

			patient.hydrate(fillPatientInfoShape(submission.patientInfo));
			setStudentDrpAnswers(submission.studentDrpAnswers ?? []);

			const snap = stableStringify(submission);
			lastSavedSnapshotRef.current = snap;

			setMrpFormData(form);
		} catch (e: any) {
			setError(e?.message ?? "Failed to load MRP tool data");
		} finally {
			setLoading(false);
		}
	}, [q, step, patient]);

	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // only on mount, per your requirement

	useEffect(() => {
		// step change only refreshes guidance/questions (no submission GET)
		(async () => {
			try {
				const form = await getStudentMrpFormData(step);
				setMrpFormData(form);
			} catch {
				// keep prior
			}
		})();
	}, [step]);

	const saveIfDirty = useCallback(async () => {
		if (saving) return false;
		if (lastSavedSnapshotRef.current && lastSavedSnapshotRef.current === currentSnapshot)
			return false;

		setSaving(true);
		setError(null);
		try {
			const payloadForBackend = {
				studentDrpAnswers: normalizeDrp(payload.studentDrpAnswers),
				patientInfo: undefinedToNullDeep(fillPatientInfoShape(payload.patientInfo)),
			};
			const saved = await saveStudentSubmission(q, payloadForBackend);
			lastSavedSnapshotRef.current = stableStringify(saved);
			return true;
		} catch (e: any) {
			setError(e?.message ?? "Failed to save submission");
			return false;
		} finally {
			setSaving(false);
		}
	}, [saving, currentSnapshot, q, payload]);

	const goPrev = useCallback(() => {
		setStep((s) => (s > 1 ? ((s - 1) as MrpStepNo) : s));
	}, []);

	const goNext = useCallback(async () => {
		await saveIfDirty();
		setStep((s) => (s < 7 ? ((s + 1) as MrpStepNo) : s));
	}, [saveIfDirty]);

	const goToStep = useCallback(
		(next: MrpStepNo) => {
			if (next <= maxUnlockedStep) setStep(next);
		},
		[maxUnlockedStep],
	);

	return {
		// state
		step,
		meta,
		steps: MRP_STEPS,
		completedByStep,
		completedCount,
		maxUnlockedStep,
		canAdvanceFromCurrentStep,

		// guidance + questions
		guidanceText: mrpFormData.guidanceText,
		reflectionQuestions: mrpFormData.reflectionQuestions,
		reflectionAnswers: getReflectionAnswersForStep(step),
		setReflectionAnswer: (k: string, v: string) => setReflectionAnswerForStep(step, k, v),

		// submission data
		patient,
		studentDrpAnswers,
		setStudentDrpAnswers,

		// io + ui flags
		loading,
		saving,
		error,
		isDirty,

		// actions
		saveIfDirty,
		goPrev,
		goNext,
		goToStep,
	};
}
