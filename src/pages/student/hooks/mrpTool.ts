// file: src/pages/student/hooks/mrpTool.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
	makeEmptyPatientInfo,
	makeEmptyStudentSubmissionPayload,
	type MrpFormData,
	type PatientInfo,
	PatientInfoSchema,
	type StudentDrpAnswer,
	type StudentSubmissionPayload,
	type StudentSubmissionQuery,
	toApiJson,
} from "../../../lib/types/studentSubmission";
import {
	getStudentMrpFormData,
	getStudentSubmission,
	saveStudentSubmission,
} from "../../../lib/api/shared/student";
import { MRP_STEPS, type MrpStepNo } from "./constants";

/* ----------------------------- Small utilities ----------------------------- */

type AnyObj = Record<string, any>;

/** True for plain objects (not arrays, not null). */
function isPlainObject(v: unknown): v is AnyObj {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Deep-merge `incoming` into `template`, preserving the template shape.
 *
 * Rules:
 * - Arrays: use incoming array if provided; otherwise template array.
 * - Objects: recurse over template keys (ensures keys exist).
 * - Primitives: use incoming if not undefined/null; otherwise template.
 * - Extra keys from incoming are preserved (forward-compat with backend additions).
 */
function mergeWithTemplate<T>(template: T, incoming: unknown): T {
	// Arrays: prefer incoming array when provided
	if (Array.isArray(template)) {
		return (Array.isArray(incoming) ? incoming : template) as any;
	}

	// Objects: recurse over template keys
	if (isPlainObject(template)) {
		const incObj = isPlainObject(incoming) ? incoming : {};
		const out: AnyObj = { ...template };

		for (const k of Object.keys(out)) {
			out[k] = mergeWithTemplate(out[k], incObj[k]);
		}

		// Preserve unknown keys from backend (don’t silently drop data)
		for (const k of Object.keys(incObj)) {
			if (!(k in out)) out[k] = incObj[k];
		}

		return out as T;
	}

	// Primitives: treat null like "missing" for UI state
	if (incoming === undefined || incoming === null) return template;
	return incoming as T;
}

/**
 * Hydrate any backend payload (including null/partial) into a full PatientInfo shape.
 * Also runs a light Zod sanity-check; if Zod fails, we still return the merged template.
 */
function hydratePatientInfo(raw: unknown): PatientInfo {
	const base = makeEmptyPatientInfo();
	const merged = mergeWithTemplate(base, raw);

	const parsed = PatientInfoSchema.safeParse(merged);
	return parsed.success ? parsed.data : merged;
}

/**
 * A stable JSON snapshot for "dirty" detection.
 * - Sorts object keys to avoid noise from key-order changes.
 */
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

/**
 * Used for step completion. Conservative:
 * - false is meaningful (user explicitly answered No)
 * - empty string is not meaningful
 * - empty object/array is not meaningful
 */
function hasAnyMeaningfulValue(v: unknown): boolean {
	if (v == null) return false;
	if (typeof v === "string") return v.trim().length > 0;
	if (typeof v === "boolean") return true;
	if (typeof v === "number") return true;
	if (Array.isArray(v)) return v.some(hasAnyMeaningfulValue);
	if (typeof v === "object") return Object.values(v as any).some(hasAnyMeaningfulValue);
	return false;
}

/**
 * Normalize DRP cards to match backend expectations:
 * - Drop draft cards with no `name`
 * - Enforce at most one priority card (first one wins)
 * - Ensure required string fields exist (empty string allowed)
 */
function normalizeDrp(items: StudentDrpAnswer[]): Array<{
	name: string;
	isPriority: boolean;
	identification: string;
	explanation: string;
	planRecommendation: string;
	monitoring: string;
}> {
	const cleaned = (items ?? []).filter((x) => (x?.name ?? "").trim().length > 0);

	let prioritySeen = false;

	return cleaned.map((x) => {
		const wantsPriority = Boolean(x.isPriority);
		const isPriority = wantsPriority && !prioritySeen;
		if (isPriority) prioritySeen = true;

		return {
			name: (x.name ?? "").trim(),
			isPriority,
			identification: (x.identification ?? "").trim(),
			explanation: (x.explanation ?? "").trim(),
			planRecommendation: (x.planRecommendation ?? "").trim(),
			monitoring: (x.monitoring ?? "").trim(),
		};
	});
}

/**
 * Build a backend-safe payload:
 * - Guarantees the full shape (all keys exist) via template merge.
 * - Converts undefined -> null so JSON keeps keys (Pydantic sees the keys).
 */
function toBackendPayload(payload: StudentSubmissionPayload) {
	const patientInfoFull = mergeWithTemplate(makeEmptyPatientInfo(), payload.patientInfo);

	return {
		patientInfo: toApiJson(patientInfoFull),
		studentDrpAnswers: normalizeDrp(payload.studentDrpAnswers ?? []),
	};
}

/* ----------------------------- usePatientInfoForm ----------------------------- */

/**
 * PatientInfo state holder with section setters.
 * Keeps a fully-shaped PatientInfo object in state.
 */
function usePatientInfoForm(initial?: unknown) {
	const [patientInfo, setPatientInfo] = useState<PatientInfo>(() =>
		hydratePatientInfo(initial ?? makeEmptyPatientInfo()),
	);

	/** Replace all patient info (used for initial load). */
	const reset = useCallback((next: unknown) => {
		setPatientInfo(hydratePatientInfo(next));
	}, []);

	/** Merge in new data (used when backend sends partial updates). */
	const hydrate = useCallback((next: unknown) => {
		setPatientInfo((cur) => mergeWithTemplate(cur, next));
	}, []);

	// Section setters
	const setMrpToolData = useCallback((next: PatientInfo["mrpToolData"]) => {
		setPatientInfo((p) => ({ ...p, mrpToolData: next }));
	}, []);

	const setPatientDemographics = useCallback((next: PatientInfo["patientDemographics"]) => {
		setPatientInfo((p) => ({ ...p, patientDemographics: next }));
	}, []);

	const setSocialHistory = useCallback((next: PatientInfo["socialHistory"]) => {
		setPatientInfo((p) => ({ ...p, socialHistory: next }));
	}, []);

	const setMedicalHistory = useCallback((next: PatientInfo["medicalHistory"]) => {
		setPatientInfo((p) => ({ ...p, medicalHistory: next }));
	}, []);

	const setMedicationList = useCallback((next: PatientInfo["medicationList"]) => {
		setPatientInfo((p) => ({ ...p, medicationList: next }));
	}, []);

	const setLabResult = useCallback((next: PatientInfo["labResult"]) => {
		setPatientInfo((p) => ({ ...p, labResult: next }));
	}, []);

	const setProgressNotes = useCallback((next: PatientInfo["progressNotes"]) => {
		setPatientInfo((p) => ({ ...p, progressNotes: next }));
	}, []);

	const validation = useMemo(() => PatientInfoSchema.safeParse(patientInfo), [patientInfo]);

	return {
		patientInfo,
		setPatientInfo,

		// sections
		mrpToolData: patientInfo.mrpToolData,
		patientDemographics: patientInfo.patientDemographics,
		socialHistory: patientInfo.socialHistory,
		medicalHistory: patientInfo.medicalHistory,
		medicationList: patientInfo.medicationList,
		labResult: patientInfo.labResult,
		progressNotes: patientInfo.progressNotes,

		// section setters
		setMrpToolData,
		setPatientDemographics,
		setSocialHistory,
		setMedicalHistory,
		setMedicationList,
		setLabResult,
		setProgressNotes,

		// hydration controls
		reset,
		hydrate,

		// validation
		isValid: validation.success,
		errors: validation.success ? null : z.treeifyError(validation.error),
	};
}

/* ----------------------------- useMrpTool ----------------------------- */

type ReflectionMap = Record<string, string>;

export function useMrpTool(q: StudentSubmissionQuery) {
	const [step, setStep] = useState<MrpStepNo>(1);

	const patient = usePatientInfoForm(makeEmptyPatientInfo());
	const [studentDrpAnswers, setStudentDrpAnswers] = useState<StudentDrpAnswer[]>([]);

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

		return {
			1: hasAnyMeaningfulValue(p.mrpToolData),
			2:
				hasAnyMeaningfulValue(p.patientDemographics) ||
				hasAnyMeaningfulValue(p.socialHistory),
			3: hasAnyMeaningfulValue(p.medicalHistory),
			4: hasAnyMeaningfulValue(p.medicationList),
			5: hasAnyMeaningfulValue(p.labResult),
			6: hasAnyMeaningfulValue(p.progressNotes),
			7: (studentDrpAnswers ?? []).length > 0,
		} satisfies Record<MrpStepNo, boolean>;
	}, [patient.patientInfo, studentDrpAnswers]);

	const completedCount = useMemo(
		() => Object.values(completedByStep).filter(Boolean).length,
		[completedByStep],
	);

	const maxUnlockedStep = useMemo<MrpStepNo>(() => {
		let unlocked: number = 1;

		for (let i = 1 as MrpStepNo; i <= 7; i = (i + 1) as MrpStepNo) {
			if (i === 7) break;
			if (completedByStep[i]) unlocked = i + 1;
			else break;
		}

		return Math.min(7, Math.max(1, unlocked)) as MrpStepNo;
	}, [completedByStep]);

	const canAdvanceFromCurrentStep = useMemo(() => completedByStep[step], [completedByStep, step]);

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
					return {};
			}
		},
		[patient.patientInfo],
	);

	/**
	 * Update a reflection answer for the current step.
	 * - Trims whitespace.
	 * - Deletes the entry when user clears the answer.
	 * - Keeps the reflectionAnswers key present (undefined allowed in UI; serializer sends null).
	 */
	const setReflectionAnswerForStep = useCallback(
		(s: MrpStepNo, key: string, value: string) => {
			const trimmed = value.trim();
			const nextVal = trimmed.length === 0 ? undefined : trimmed;

			const upsert = (m?: ReflectionMap): ReflectionMap | undefined => {
				const cur = m ?? {};
				const next: ReflectionMap = { ...cur };

				if (nextVal == null) delete next[key];
				else next[key] = nextVal;

				return Object.keys(next).length === 0 ? undefined : next;
			};

			const p = patient.patientInfo;

			switch (s) {
				case 1:
					patient.setMrpToolData({
						...p.mrpToolData,
						reflectionAnswers: upsert(p.mrpToolData.reflectionAnswers),
					});
					return;

				case 2:
					patient.setPatientDemographics({
						...p.patientDemographics,
						reflectionAnswers: upsert(p.patientDemographics.reflectionAnswers),
					});
					return;

				case 3:
					patient.setMedicalHistory({
						...p.medicalHistory,
						reflectionAnswers: upsert(p.medicalHistory.reflectionAnswers),
					});
					return;

				case 4:
					patient.setMedicationList({
						...p.medicationList,
						reflectionAnswers: upsert(p.medicationList.reflectionAnswers),
					});
					return;

				case 5:
					patient.setLabResult({
						...p.labResult,
						reflectionAnswers: upsert(p.labResult.reflectionAnswers),
					});
					return;

				case 6:
					patient.setProgressNotes({
						...p.progressNotes,
						reflectionAnswers: upsert(p.progressNotes.reflectionAnswers),
					});
					return;

				case 7:
					return;
			}
		},
		[patient],
	);

	/**
	 * Initial load:
	 * - Fetch submission + current step form data.
	 * - Submission might be empty/partial - hydrate into full shape.
	 *
	 * Intentionally called once on mount; callers should remount if `q` changes.
	 */
	const load = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const [rawSubmission, form] = await Promise.all([
				getStudentSubmission(q),
				getStudentMrpFormData(step),
			]);

			const submission = mergeWithTemplate(
				makeEmptyStudentSubmissionPayload(),
				rawSubmission,
			);

			patient.reset(hydratePatientInfo(submission.patientInfo));
			setStudentDrpAnswers(submission.studentDrpAnswers ?? []);

			lastSavedSnapshotRef.current = stableStringify(submission);
			setMrpFormData(form);
		} catch (e: any) {
			setError(e?.message ?? "Failed to load MRP tool data");
		} finally {
			setLoading(false);
		}
	}, [patient, q, step]);

	useEffect(() => {
		void load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Step change fetches guidance/questions only.
	 * It does not re-fetch the full submission.
	 */
	useEffect(() => {
		(async () => {
			try {
				const form = await getStudentMrpFormData(step);
				setMrpFormData(form);
			} catch {
				// Keep prior data if the form fetch fails.
			}
		})();
	}, [step]);

	/**
	 * Save if the current payload differs from last saved snapshot.
	 * Produces a backend-valid JSON payload (keys present, nulls allowed).
	 */
	const saveIfDirty = useCallback(async () => {
		if (saving) return false;
		if (lastSavedSnapshotRef.current && lastSavedSnapshotRef.current === currentSnapshot)
			return false;

		setSaving(true);
		setError(null);

		try {
			const payloadForBackend = toBackendPayload(payload);
			const saved = await saveStudentSubmission(q, payloadForBackend);

			// Snapshot should reflect what backend returns (source of truth)
			lastSavedSnapshotRef.current = stableStringify(saved);
			return true;
		} catch (e: any) {
			setError(e?.message ?? "Failed to save submission");
			return false;
		} finally {
			setSaving(false);
		}
	}, [currentSnapshot, payload, q, saving]);

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
