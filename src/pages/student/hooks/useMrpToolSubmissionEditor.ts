// file: src/pages/student/hooks/useMrpToolSubmissionEditor.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MrpFormData, StudentSubmissionQuery } from "../../../lib/types/studentSubmission";
import { getStudentMrpFormData } from "../../../lib/api/shared/student";
import { MRP_STEPS, type MrpStepNo } from "./constants";
import {
	type SaveOptions,
	type SubmissionEditorApi,
	useStudentSubmissionEditor,
} from "./useStudentSubmissionEditor.ts";

/* ----------------------------- Types -------------------------------------- */

type ReflectionMap = Record<string, string>;

export type MrpToolApi = SubmissionEditorApi & {
	// wizard state
	step: MrpStepNo;
	meta: (typeof MRP_STEPS)[number];
	steps: typeof MRP_STEPS;
	completedByStep: Record<MrpStepNo, boolean>;
	completedCount: number;
	maxUnlockedStep: MrpStepNo;
	canAdvanceFromCurrentStep: boolean;

	// guidance + questions
	guidanceText: string;
	reflectionQuestions: MrpFormData["reflectionQuestions"];
	reflectionAnswers: ReflectionMap;
	setReflectionAnswer: (k: string, v: string) => void;

	// wizard navigation
	goPrev: () => void;
	goNext: () => Promise<void>;
	goToStep: (next: MrpStepNo) => void;
};

/* ----------------------------- Small utils -------------------------------- */

/**
 * Returns true if a value should count as "filled" for step completion.
 *
 * Notes:
 * - Strings must be non-empty after trim.
 * - Numbers/booleans count as meaningful if present (including 0 / false).
 * - Arrays/objects are meaningful if any nested value is meaningful.
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

/* ----------------------------- Hook --------------------------------------- */

/**
 * Wizard-specific wrapper around `useStudentSubmissionEditor` for the MRP tool.
 *
 * Responsibilities:
 * - Track current step, completion state, and navigation guards (max unlocked step).
 * - Fetch per-step guidance + reflection questions (read-only metadata).
 * - Provide typed helpers to read/write reflection answers for the active step.
 *
 * Gotchas:
 * - Step completion is based on "any meaningful value" in the step's payload, not strict validation.
 * - Reflection answers are stored on the patient payload per-step; step 7 has none.
 */
export function useMrpToolSubmissionEditor(q: StudentSubmissionQuery): MrpToolApi {
	// Shared editor core (handles data, dirty tracking, save/submit).
	const editor = useStudentSubmissionEditor(q, { isMrp: true });

	// Wizard step state (1..7).
	const [step, setStep] = useState<MrpStepNo>(1);

	/**
	 * Metadata for the current step (title, description, etc).
	 * Non-null assertion is safe because `step` is constrained to MRP_STEPS range.
	 */
	const meta = useMemo(() => MRP_STEPS.find((s) => s.step === step)!, [step]);

	/**
	 * Server-provided form metadata for the active step.
	 * Only guidance/questions are stored here - the user's answers live in `editor.patient.patientInfo`.
	 */
	const [mrpFormData, setMrpFormData] = useState<MrpFormData>({
		guidanceText: "",
		reflectionQuestions: {},
	});

	/**
	 * Per-step completion map used for progress UI and lock/unlock behavior.
	 *
	 * Note: Step 2 treats demographics AND social history as completion (One field each),
	 * since the UI splits those sub-sections but they share the same step.
	 */
	const completedByStep = useMemo(() => {
		const p = editor.patient.patientInfo;

		return {
			1: hasAnyMeaningfulValue(p.mrpToolData),
			2:
				hasAnyMeaningfulValue(p.patientDemographics) &&
				hasAnyMeaningfulValue(p.socialHistory),
			3: hasAnyMeaningfulValue(p.medicalHistory),
			4: hasAnyMeaningfulValue(p.medicationList),
			5: hasAnyMeaningfulValue(p.labResult),
			6: hasAnyMeaningfulValue(p.progressNotes),
			7: (editor.studentDrpAnswers ?? []).length > 0,
		} satisfies Record<MrpStepNo, boolean>;
	}, [editor.patient.patientInfo, editor.studentDrpAnswers]);

	/** Count of completed steps (for progress indicators). */
	const completedCount = useMemo(
		() => Object.values(completedByStep).filter(Boolean).length,
		[completedByStep],
	);

	/**
	 * Highest step a user can navigate to without completing intermediate steps.
	 *
	 * Rule:
	 * - Step 1 is always available.
	 * - You unlock the next step only when the current step is completed.
	 * - Step 7 is last; we stop unlocking at 7.
	 */
	const maxUnlockedStep = useMemo<MrpStepNo>(() => {
		let unlocked: number = 1;

		for (let i = 1 as MrpStepNo; i <= 7; i = (i + 1) as MrpStepNo) {
			if (i === 7) break;
			if (completedByStep[i]) unlocked = i + 1;
			else break;
		}

		return Math.min(7, Math.max(1, unlocked)) as MrpStepNo;
	}, [completedByStep]);

	/** True if the current step has enough data to count as "complete". */
	const canAdvanceFromCurrentStep = useMemo(() => completedByStep[step], [completedByStep, step]);

	/**
	 * Read reflection answers for a given step from the editor payload.
	 * Step 7 does not have reflection answers.
	 */
	const getReflectionAnswersForStep = useCallback(
		(s: MrpStepNo): ReflectionMap => {
			const p = editor.patient.patientInfo;

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
		[editor.patient.patientInfo],
	);

	/**
	 * Update a single reflection answer for a given step.
	 *
	 * Behavior:
	 * - Values are trimmed.
	 * - Empty strings delete the key (keeps payload tidy and avoids persisting "blank" answers).
	 * - If the map becomes empty, we store it as `undefined` (not `{}`), matching backend expectations.
	 *
	 * Gotcha:
	 * - This function updates nested state via editor setters; it assumes those setters merge correctly.
	 */
	const setReflectionAnswerForStep = useCallback(
		(s: MrpStepNo, key: string, value: string) => {
			// Normalize input: store meaningful strings only.
			const trimmed = value.trim();
			const nextVal = trimmed.length === 0 ? undefined : trimmed;

			/**
			 * Insert/update/delete a key and collapse empty maps to `undefined`.
			 * This keeps the payload compact and avoids sending empty objects.
			 */
			const upsert = (m?: ReflectionMap): ReflectionMap | undefined => {
				const cur = m ?? {};
				const next: ReflectionMap = { ...cur };

				if (nextVal == null) delete next[key];
				else next[key] = nextVal;

				return Object.keys(next).length === 0 ? undefined : next;
			};

			const p = editor.patient.patientInfo;

			switch (s) {
				case 1:
					editor.patient.setMrpToolData({
						...p.mrpToolData,
						reflectionAnswers: upsert(p.mrpToolData.reflectionAnswers),
					});
					return;

				case 2:
					editor.patient.setPatientDemographics({
						...p.patientDemographics,
						reflectionAnswers: upsert(p.patientDemographics.reflectionAnswers),
					});
					return;

				case 3:
					editor.patient.setMedicalHistory({
						...p.medicalHistory,
						reflectionAnswers: upsert(p.medicalHistory.reflectionAnswers),
					});
					return;

				case 4:
					editor.patient.setMedicationList({
						...p.medicationList,
						reflectionAnswers: upsert(p.medicationList.reflectionAnswers),
					});
					return;

				case 5:
					editor.patient.setLabResult({
						...p.labResult,
						reflectionAnswers: upsert(p.labResult.reflectionAnswers),
					});
					return;

				case 6:
					editor.patient.setProgressNotes({
						...p.progressNotes,
						reflectionAnswers: upsert(p.progressNotes.reflectionAnswers),
					});
					return;

				case 7:
					// No reflection answers on step 7.
					return;
			}
		},
		[editor.patient],
	);

	/**
	 * Fetch server-provided guidance/questions when the step changes.
	 * Failure is intentionally silent to avoid breaking the editor UI.
	 */
	useEffect(() => {
		(async () => {
			try {
				const form = await getStudentMrpFormData(step);
				setMrpFormData(form);
			} catch {
				// Keep prior guidance/questions on transient errors.
			}
		})();
	}, [step]);

	/** Move to previous step (clamped at 1). */
	const goPrev = useCallback(() => {
		setStep((s) => (s > 1 ? ((s - 1) as MrpStepNo) : s));
	}, []);

	/**
	 * Save draft state (if dirty) and advance by one step (clamped at 7).
	 * Note: advancement is not gated here - the UI should enforce `canAdvanceFromCurrentStep`.
	 */
	const goNext = useCallback(async () => {
		await editor.saveIfDirty({ isSubmit: false } satisfies SaveOptions);
		setStep((s) => (s < 7 ? ((s + 1) as MrpStepNo) : s));
	}, [editor]);

	/**
	 * Jump to a step if it's unlocked. Locked steps are ignored.
	 * This prevents users from skipping ahead without completing required prior steps.
	 */
	const goToStep = useCallback(
		(next: MrpStepNo) => {
			if (next <= maxUnlockedStep) setStep(next);
		},
		[maxUnlockedStep],
	);

	return {
		...editor,

		step,
		meta,
		steps: MRP_STEPS,
		completedByStep,
		completedCount,
		maxUnlockedStep,
		canAdvanceFromCurrentStep,

		guidanceText: mrpFormData.guidanceText,
		reflectionQuestions: mrpFormData.reflectionQuestions,
		reflectionAnswers: getReflectionAnswersForStep(step),
		setReflectionAnswer: (k: string, v: string) => setReflectionAnswerForStep(step, k, v),

		goPrev,
		goNext,
		goToStep,
	};
}
