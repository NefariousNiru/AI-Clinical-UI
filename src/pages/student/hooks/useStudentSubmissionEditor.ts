// file: src/pages/student/hooks/useStudentSubmissionEditor.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
	makeEmptyPatientInfo,
	makeEmptyStudentSubmissionPayload,
	type MedicationHistory,
	type PatientInfo,
	PatientInfoSchema,
	type StudentDrpAnswer,
	type StudentSubmissionPayload,
	type StudentSubmissionQuery,
	toApiJson,
} from "../../../lib/types/studentSubmission";
import { getStudentSubmission, saveStudentSubmission } from "../../../lib/api/shared/student";

/* ----------------------------- Public Types -------------------------------- */

export type SaveOptions = { isSubmit: boolean };

export type PatientInfoFormController = {
	patientInfo: PatientInfo;
	setPatientInfo: React.Dispatch<React.SetStateAction<PatientInfo>>;

	// sections
	mrpToolData: PatientInfo["mrpToolData"];
	patientDemographics: PatientInfo["patientDemographics"];
	socialHistory: PatientInfo["socialHistory"];
	medicalHistory: PatientInfo["medicalHistory"];
	medicationList: PatientInfo["medicationList"];
	labResult: PatientInfo["labResult"];
	progressNotes: PatientInfo["progressNotes"];

	// section setters
	setMrpToolData: (next: PatientInfo["mrpToolData"]) => void;
	setPatientDemographics: (next: PatientInfo["patientDemographics"]) => void;
	setSocialHistory: (next: PatientInfo["socialHistory"]) => void;
	setMedicalHistory: (next: PatientInfo["medicalHistory"]) => void;
	setMedicationList: (next: PatientInfo["medicationList"]) => void;
	setLabResult: (next: PatientInfo["labResult"]) => void;
	setProgressNotes: (next: PatientInfo["progressNotes"]) => void;

	// hydration controls
	reset: (next: unknown) => void;
	hydrate: (next: unknown) => void;

	// validation
	isValid: boolean;
	errors: unknown;

	/**
	 * Append a new empty medication row to the medication list.
	 * Centralized here so all flows (MRP + standard) share identical behavior.
	 */
	addMedication: () => void;

	/**
	 * Remove a medication row by index. No-op if index is out of bounds.
	 */
	removeMedicationAt: (index: number) => void;

	/**
	 * Patch a medication row by index. No-op if index is out of bounds.
	 */
	updateMedicationAt: (index: number, patch: Partial<MedicationHistory>) => void;
};

export type SubmissionEditorApi = {
	// identity
	isMrp: boolean;

	// submission data
	patient: PatientInfoFormController;
	studentDrpAnswers: StudentDrpAnswer[];
	setStudentDrpAnswers: React.Dispatch<React.SetStateAction<StudentDrpAnswer[]>>;

	// io + ui flags
	loading: boolean;
	saving: boolean;
	error: string | null;
	isDirty: boolean;

	// actions
	refresh: () => Promise<void>;
	saveIfDirty: (opts: SaveOptions) => Promise<boolean>;
};

/* ----------------------------- Small utilities ----------------------------- */

type AnyObj = Record<string, any>;

/**
 * Returns true when `v` is a non-null, non-array object.
 * Used to distinguish objects from arrays/primitives during merges.
 */
function isPlainObject(v: unknown): v is AnyObj {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Deep-merges `incoming` onto `template`, preserving the template's shape.
 *
 * Rules:
 * - Arrays: keep template unless incoming is also an array (then take incoming).
 * - Objects: recursively merge keys from template; also copy any extra keys from incoming.
 * - Primitives: if incoming is null/undefined, keep template; otherwise take incoming.
 *
 * Gotcha:
 * - This is shape-oriented, not schema-oriented. It does not validate types.
 */
function mergeWithTemplate<T>(template: T, incoming: unknown): T {
	if (Array.isArray(template)) {
		return (Array.isArray(incoming) ? incoming : template) as any;
	}

	if (isPlainObject(template)) {
		const incObj = isPlainObject(incoming) ? incoming : {};
		const out: AnyObj = { ...template };

		// Ensure every template key exists in the output, recursively filled.
		for (const k of Object.keys(out)) {
			out[k] = mergeWithTemplate(out[k], incObj[k]);
		}

		// Preserve forward-compat keys coming from backend.
		for (const k of Object.keys(incObj)) {
			if (!(k in out)) out[k] = incObj[k];
		}

		return out as T;
	}

	if (incoming === undefined || incoming === null) return template;
	return incoming as T;
}

/**
 * Hydrates raw patient info into a full PatientInfo shape and best-effort validates it.
 *
 * Behavior:
 * - Fill missing keys using the empty template shape.
 * - If schema validation succeeds, return the parsed data (saner types/defaults).
 * - If validation fails, return the merged object anyway to avoid blocking UI.
 */
function hydratePatientInfo(raw: unknown): PatientInfo {
	const base = makeEmptyPatientInfo();
	const merged = mergeWithTemplate(base, raw);

	const parsed = PatientInfoSchema.safeParse(merged);
	return parsed.success ? parsed.data : merged;
}

/**
 * Deterministic JSON stringify for dirty detection.
 *
 * Notes:
 * - Sorts object keys to avoid order-based diffs.
 * - Replaces circular references with a placeholder (should not happen, but avoids crashes).
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
 * Normalizes DRP answers into a backend-friendly shape.
 *
 * Rules:
 * - Drop entries with empty name.
 * - Trim all strings.
 * - Enforce at most one `isPriority=true` (first one wins).
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

	// Ensure we never send multiple priorities to the backend.
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
 * Converts the editor payload into the backend submission payload.
 *
 * Notes:
 * - Always sends a full PatientInfo shape so missing keys are explicit.
 * - Uses `toApiJson` for snake_case/camelCase and other API conventions.
 */
function toBackendPayload(payload: StudentSubmissionPayload) {
	const patientInfoFull = mergeWithTemplate(makeEmptyPatientInfo(), payload.patientInfo);

	return {
		patientInfo: toApiJson(patientInfoFull),
		studentDrpAnswers: normalizeDrp(payload.studentDrpAnswers ?? []),
	};
}

/**
 * Builds a stable snapshot string used for dirty detection.
 *
 * Important:
 * - Snapshot a full submission shape (not partial) so missing keys do not
 *   cause false dirty/no-dirty when backend fills defaults.
 */
function snapshotForDirtyDetection(rawSubmission: unknown): string {
	const full = mergeWithTemplate(makeEmptyStudentSubmissionPayload(), rawSubmission);
	return stableStringify(full);
}

/* --------------------------- usePatientInfoForm ---------------------------- */

/**
 * Create an empty medication row.
 * Keep this here (not in the form) so every caller creates the same shape.
 */
export function makeEmptyMedication(): MedicationHistory {
	return { scheduledStartStopDate: undefined, prn: undefined };
}

/**
 * Local form controller for PatientInfo with:
 * - full-shape hydration (missing keys filled),
 * - section-level setters for ergonomics,
 * - schema validation for UI gating.
 *
 * Terminology:
 * - reset(): replace full state from raw input (used after refresh).
 * - hydrate(): merge partial input into current state (used for incremental fills).
 */
function usePatientInfoForm(initial?: unknown): PatientInfoFormController {
	const [patientInfo, setPatientInfo] = useState<PatientInfo>(() =>
		hydratePatientInfo(initial ?? makeEmptyPatientInfo()),
	);

	/** Replace the whole patientInfo with a hydrated version of `next`. */
	const reset = useCallback((next: unknown) => {
		setPatientInfo(hydratePatientInfo(next));
	}, []);

	/** Merge a partial update into current patientInfo, preserving shape. */
	const hydrate = useCallback((next: unknown) => {
		setPatientInfo((cur) => mergeWithTemplate(cur, next));
	}, []);

	/** Section setter helpers keep call sites simple and avoid deep merges in UI. */
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

	/**
	 * Append a new medication entry.
	 * Uses functional update to avoid stale closures.
	 */
	const addMedication = useCallback(() => {
		setPatientInfo((p) => ({
			...p,
			medicationList: {
				...p.medicationList,
				medications: [...(p.medicationList.medications ?? []), makeEmptyMedication()],
			},
		}));
	}, []);

	/**
	 * Remove medication at index (no-op if out of bounds).
	 */
	const removeMedicationAt = useCallback((index: number) => {
		setPatientInfo((p) => {
			const meds = p.medicationList.medications ?? [];
			if (index < 0 || index >= meds.length) return p;

			return {
				...p,
				medicationList: {
					...p.medicationList,
					medications: meds.filter((_, i) => i !== index),
				},
			};
		});
	}, []);

	/**
	 * Patch medication at index (no-op if out of bounds).
	 */
	const updateMedicationAt = useCallback((index: number, patch: Partial<MedicationHistory>) => {
		setPatientInfo((p) => {
			const meds = p.medicationList.medications ?? [];
			const cur = meds[index];
			if (!cur) return p;

			const next = meds.slice();
			next[index] = { ...cur, ...patch };

			return {
				...p,
				medicationList: {
					...p.medicationList,
					medications: next,
				},
			};
		});
	}, []);

	/**
	 * Schema validation is used for UI gates and debugging.
	 * We keep errors treeified so it's easy to render or log.
	 */
	const validation = useMemo(() => PatientInfoSchema.safeParse(patientInfo), [patientInfo]);

	return {
		patientInfo,
		setPatientInfo,

		mrpToolData: patientInfo.mrpToolData,
		patientDemographics: patientInfo.patientDemographics,
		socialHistory: patientInfo.socialHistory,
		medicalHistory: patientInfo.medicalHistory,
		medicationList: patientInfo.medicationList,
		labResult: patientInfo.labResult,
		progressNotes: patientInfo.progressNotes,

		setMrpToolData,
		setPatientDemographics,
		setSocialHistory,
		setMedicalHistory,
		setMedicationList,
		setLabResult,
		setProgressNotes,

		reset,
		hydrate,

		isValid: validation.success,
		errors: validation.success ? null : z.treeifyError(validation.error),

		addMedication,
		removeMedicationAt,
		updateMedicationAt,
	};
}

/* ---------------------- Shared editor core hook ---------------------------- */

/**
 * Shared core hook for editing a student submission (MRP wizard and standard flow).
 *
 * Provides:
 * - hydrated form state + section setters
 * - DRP answers editing
 * - refresh/load from backend
 * - save-if-dirty with deterministic dirty detection
 *
 * Gotchas:
 * - Dirty detection compares stable snapshots of a full submission shape.
 * - `isMrp` is carried for callers; save uses the same endpoint for both flows.
 */
export function useStudentSubmissionEditor(
	q: StudentSubmissionQuery,
	opts: { isMrp: boolean },
): SubmissionEditorApi {
	const { isMrp } = opts;

	const patient = usePatientInfoForm(makeEmptyPatientInfo());
	const [studentDrpAnswers, setStudentDrpAnswers] = useState<StudentDrpAnswer[]>([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Backend snapshot of last successful save/load, used for dirty detection.
	const lastSavedSnapshotRef = useRef<string>("");

	/**
	 * Current local payload (minimal). We later shape it for:
	 * - stable dirty detection
	 * - backend submission (full PatientInfo shape + normalized DRP)
	 */
	const payload: StudentSubmissionPayload = useMemo(
		() => ({
			patientInfo: patient.patientInfo,
			studentDrpAnswers,
		}),
		[patient.patientInfo, studentDrpAnswers],
	);

	/**
	 * Stable snapshot of the current local state.
	 * We expand to a full submission template so missing keys don't skew comparisons.
	 */
	const currentSnapshot = useMemo(() => {
		const shaped = mergeWithTemplate(makeEmptyStudentSubmissionPayload(), payload);
		return stableStringify(shaped);
	}, [payload]);

	/**
	 * True when current local state differs from the last backend snapshot.
	 * If we haven't loaded yet, we treat as not dirty.
	 */
	const isDirty = useMemo(() => {
		if (!lastSavedSnapshotRef.current) return false;
		return lastSavedSnapshotRef.current !== currentSnapshot;
	}, [currentSnapshot]);

	/**
	 * Loads the submission from backend and resets local state.
	 * Also seeds the dirty snapshot from the backend response (source of truth).
	 */
	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const rawSubmission = await getStudentSubmission(q);
			const full = mergeWithTemplate(makeEmptyStudentSubmissionPayload(), rawSubmission);

			// Reset to backend values (not merge) to avoid keeping stale local fields.
			patient.reset(hydratePatientInfo(full.patientInfo));
			setStudentDrpAnswers(full.studentDrpAnswers ?? []);

			lastSavedSnapshotRef.current = snapshotForDirtyDetection(full);
		} catch (e: any) {
			setError(e?.message ?? "Failed to load submission");
		} finally {
			setLoading(false);
		}
	}, [patient, q]);

	useEffect(() => {
		void refresh();
		// callers remount if q changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Saves to backend only if we are dirty.
	 *
	 * Returns:
	 * - true if a save happened and succeeded
	 * - false if we were not dirty, already saving, or save failed
	 *
	 * Notes:
	 * - Uses backend response to refresh the dirty snapshot (backend is source of truth).
	 */
	const saveIfDirty = useCallback(
		async (saveOpts: SaveOptions) => {
			if (saving) return false;

			// Fast path: avoid write if nothing changed since last backend snapshot.
			if (lastSavedSnapshotRef.current && lastSavedSnapshotRef.current === currentSnapshot)
				return false;

			setSaving(true);
			setError(null);

			try {
				const payloadForBackend = toBackendPayload(payload);

				// Same endpoint for both flows. `isMrp` is a UI concern, not a save concern.
				const saved = await saveStudentSubmission(q, saveOpts.isSubmit, payloadForBackend);

				// Snapshot reflects backend source-of-truth.
				lastSavedSnapshotRef.current = snapshotForDirtyDetection(saved);
				return true;
			} catch (e: any) {
				setError(e?.message ?? "Failed to save submission");
				return false;
			} finally {
				setSaving(false);
			}
		},
		[currentSnapshot, payload, q, saving],
	);

	return {
		isMrp,

		patient,
		studentDrpAnswers,
		setStudentDrpAnswers,

		loading,
		saving,
		error,
		isDirty,

		refresh,
		saveIfDirty,
	};
}
