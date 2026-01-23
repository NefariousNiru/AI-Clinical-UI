// file: src/pages/admin/hooks/rubric.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	addRubric,
	getAllRubricPatients,
	getRubricByUnique,
	updateRubric,
} from "../../../lib/api/admin/rubric";
import type { RubricRequest } from "../../../lib/types/rubric";
import {
	type RubricJson,
	RubricJsonSchema,
	type RubricStatus,
	RubricStatusSchema,
} from "../../../lib/types/rubricSchema";
import { canonicalizeAndValidate } from "../../../lib/utils/rubricEdit";
import { normalizeKeysToCamelDeep } from "../../../lib/utils/functions.ts";
import { ApiError } from "../../../lib/api/http.ts";

export type RubricEditorMode = "idle" | "create" | "edit";
export type OpenEditResult = "ok" | "not_found" | "error";

export type UseRubricEditorResult = {
	mode: RubricEditorMode;
	rubricId: string | null;
	patientLastName: string | null;

	view: "form" | "json";
	setView: (v: "form" | "json") => void;

	raw: string;
	setRaw: (next: string) => void;

	fileDraft: RubricJson | null;
	setFileDraft: (next: RubricJson) => void;

	instructorName: string;
	setInstructorName: (v: string) => void;

	status: RubricStatus;
	setStatus: (v: RubricStatus) => void;

	notes: string;
	setNotes: (v: string) => void;

	valid: boolean;
	errors: string[];

	validationVisible: boolean;
	setValidationVisible: (v: boolean) => void;

	loading: boolean;
	saving: boolean;
	error: string | null;

	openCreate: (diseaseName: string, patientLastName: string) => void;
	openEdit: (diseaseName: string, patientLastName: string) => Promise<OpenEditResult>;
	close: () => void;

	save: (opts?: { confirmReplace?: boolean }) => Promise<boolean>;
};

function pathToString(path: PropertyKey[]): string {
	if (!path.length) return "(root)";
	return path
		.map((p) =>
			typeof p === "symbol"
				? p.description
					? `Symbol(${p.description})`
					: "Symbol(?)"
				: String(p),
		)
		.join(".");
}

function formatZodIssues(issues: Array<{ path: PropertyKey[]; message: string }>): string[] {
	return issues.map((i) => `${pathToString(i.path)}: ${i.message}`);
}

function formatRuleIssues(issues: Array<{ path: string; message: string }>): string[] {
	return issues.map((i) => `${i.path}: ${i.message}`);
}

function makeSkeletonRubric(rubricId: string): RubricJson {
	return {
		rubricId,
		rubricVersion: "1.0",
		schemaVersion: "1.0",
		scoringInvariants: {
			requireSectionBlockSumsMatch: true,
			evidenceScope: "section",
			notes: "",
		},
		contraindicationsPolicy: "non_scored_feedback_only",
		evidenceKeys: [],
		sections: [
			{
				id: "identification",
				title: "Identification of Problem",
				maxPoints: 0,
				blocks: [
					{
						id: "priority",
						title: "Priority",
						maxPoints: 0,
						criteria: [
							{
								type: "binary",
								key: "priority_level",
								verbiage: "Priority identified",
								weight: 0,
								unitEquivalents: null,
								notes: null,
								aliases: null,
							},
						],
						notes: "",
					},
				],
			},
			{
				id: "explanation",
				title: "Explanation",
				maxPoints: 0,
				blocks: [
					{
						id: "explanation_block",
						title: "Explanation",
						maxPoints: 0,
						criteria: [],
						notes: "",
					},
				],
			},
			{
				id: "plan_recommendation",
				title: "Plan/Recommendation",
				maxPoints: 0,
				blocks: [
					{
						id: "plan_block",
						title: "Plan",
						maxPoints: 0,
						criteria: [],
						notes: "",
					},
				],
			},
			{
				id: "monitoring",
				title: "Monitoring",
				maxPoints: 0,
				blocks: [
					{
						id: "monitoring_core",
						title: "Monitoring",
						maxPoints: 0,
						criteria: [],
						notes: "",
					},
				],
			},
		],
		nonScoredClinicalNotes: [],
	};
}

type ValidationResult =
	| { ok: true; canonical: RubricJson; errors: string[] }
	| { ok: false; canonical: null; errors: string[] };

function validateFileUnknown(
	nextUnknown: unknown,
	expectedRubricId: string | null,
): ValidationResult {
	const normalized = normalizeKeysToCamelDeep(nextUnknown);
	const parsed = RubricJsonSchema.safeParse(normalized);
	if (!parsed.success) {
		return {
			ok: false,
			canonical: null,
			errors: formatZodIssues(
				parsed.error.issues as Array<{ path: PropertyKey[]; message: string }>,
			),
		};
	}

	if (expectedRubricId && parsed.data.rubricId !== expectedRubricId) {
		return {
			ok: false,
			canonical: null,
			errors: [
				`rubricId: must equal selected disease slug "${expectedRubricId}", got "${parsed.data.rubricId}"`,
			],
		};
	}

	const { draft: canonical, issues } = canonicalizeAndValidate(parsed.data);
	if (issues.length) return { ok: false, canonical: null, errors: formatRuleIssues(issues) };

	return { ok: true, canonical, errors: [] };
}

function validateMeta(instructorName: string, status: string | null): string[] {
	const errs: string[] = [];

	if (!instructorName.trim()) errs.push("instructorName: is required.");

	const st = RubricStatusSchema.safeParse(status);
	if (!st.success) errs.push('status: must be "testing" or "completed".');

	return errs;
}

function isNotFoundError(e: unknown): boolean {
	if (!e || typeof e !== "object") return false;
	const anyE = e as any;

	// Common patterns in custom http wrappers
	if (anyE.status === 404) return true;
	if (anyE.status_code === 404) return true;
	if (anyE.response && anyE.response.status === 404) return true;
	if (anyE.response && anyE.response.statusCode === 404) return true;

	// Some wrappers attach a "code"
	if (typeof anyE.code === "string" && anyE.code.toUpperCase().includes("NOT_FOUND")) return true;

	return false;
}

export function useRubricEditor(): UseRubricEditorResult {
	const [mode, setMode] = useState<RubricEditorMode>("idle");
	const [rubricId, setRubricId] = useState<string | null>(null);
	const [patientLastName, setPatientLastName] = useState<string | null>(null);

	const [view, _setView] = useState<"form" | "json">("form");

	const [raw, _setRaw] = useState("");
	const [fileDraft, _setFileDraft] = useState<RubricJson | null>(null);

	const [instructorName, _setInstructorName] = useState("");
	const [status, _setStatus] = useState<RubricStatus>("testing");
	const [notes, _setNotes] = useState("");

	const [valid, setValid] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [validationVisible, setValidationVisible] = useState(false);

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const syncingFromRawRef = useRef(false);
	const syncingFromDraftRef = useRef(false);

	const lastErrorsRef = useRef<string[]>([]);
	const lastValidRef = useRef<boolean>(false);

	function applyValidationSnapshot(v: boolean, errs: string[]) {
		lastValidRef.current = v;
		lastErrorsRef.current = errs;

		setValid(v);
		if (validationVisible) setErrors(errs);
		else setErrors([]);
	}

	const setView = useCallback((v: "form" | "json") => {
		_setView(v);
		setValidationVisible(v === "json");
	}, []);

	const setInstructorName = useCallback(
		(v: string) => {
			_setInstructorName(v);
			const metaErrs = validateMeta(v, status);
			const merged = [
				...metaErrs,
				...lastErrorsRef.current.filter(
					(e) => !e.startsWith("instructorName:") && !e.startsWith("status:"),
				),
			];
			applyValidationSnapshot(metaErrs.length === 0 && lastValidRef.current, merged);
		},
		[status],
	); // eslint-disable-line react-hooks/exhaustive-deps

	const setStatus = useCallback(
		(v: RubricStatus) => {
			_setStatus(v);
			const metaErrs = validateMeta(instructorName, v);
			const merged = [
				...metaErrs,
				...lastErrorsRef.current.filter(
					(e) => !e.startsWith("instructorName:") && !e.startsWith("status:"),
				),
			];
			applyValidationSnapshot(metaErrs.length === 0 && lastValidRef.current, merged);
		},
		[instructorName],
	); // eslint-disable-line react-hooks/exhaustive-deps

	const setNotes = useCallback((v: string) => {
		_setNotes(v);
	}, []);

	const setFileDraft = useCallback(
		(next: RubricJson) => {
			_setFileDraft(next);

			if (syncingFromRawRef.current) {
				applyValidationSnapshot(lastValidRef.current, lastErrorsRef.current);
				return;
			}

			const fileRes = validateFileUnknown(next, rubricId);
			const metaErrs = validateMeta(instructorName, status);

			if (fileRes.ok) {
				_setFileDraft(fileRes.canonical);

				syncingFromDraftRef.current = true;
				_setRaw(JSON.stringify(fileRes.canonical, null, 2));
				syncingFromDraftRef.current = false;

				const ok = metaErrs.length === 0;
				applyValidationSnapshot(ok, ok ? [] : metaErrs);
			} else {
				syncingFromDraftRef.current = true;
				_setRaw(JSON.stringify(next, null, 2));
				syncingFromDraftRef.current = false;

				const merged = [...metaErrs, ...fileRes.errors];
				applyValidationSnapshot(false, merged);
			}
		},
		[rubricId, instructorName, status, validationVisible],
	); // eslint-disable-line react-hooks/exhaustive-deps

	const setRaw = useCallback(
		(next: string) => {
			_setRaw(next);
			if (syncingFromDraftRef.current) return;

			syncingFromRawRef.current = true;
			try {
				const parsedJson: unknown = JSON.parse(next);

				const fileRes = validateFileUnknown(parsedJson, rubricId);
				const metaErrs = validateMeta(instructorName, status);

				if (fileRes.ok) {
					_setFileDraft(fileRes.canonical);
					_setRaw(JSON.stringify(fileRes.canonical, null, 2));

					const ok = metaErrs.length === 0;
					applyValidationSnapshot(ok, ok ? [] : metaErrs);
				} else {
					_setFileDraft(null);
					const merged = [...metaErrs, ...fileRes.errors];
					applyValidationSnapshot(false, merged);
				}
			} catch {
				_setFileDraft(null);
				const metaErrs = validateMeta(instructorName, status);
				applyValidationSnapshot(false, [
					...metaErrs,
					"(root): Invalid JSON (failed to parse).",
				]);
			} finally {
				syncingFromRawRef.current = false;
			}
		},
		[rubricId, instructorName, status, validationVisible],
	); // eslint-disable-line react-hooks/exhaustive-deps

	const openCreate = useCallback(
		(diseaseName: string, patient: string) => {
			setError(null);
			setMode("create");
			setRubricId(diseaseName);
			setPatientLastName(patient);
			setView("form");
			setValidationVisible(false);

			_setInstructorName("");
			_setStatus("testing");
			_setNotes("");

			const skel = makeSkeletonRubric(diseaseName);
			const fileRes = validateFileUnknown(skel, diseaseName);
			const metaErrs = validateMeta("", "testing");

			if (fileRes.ok) {
				_setFileDraft(fileRes.canonical);
				_setRaw(JSON.stringify(fileRes.canonical, null, 2));
			} else {
				_setFileDraft(skel);
				_setRaw(JSON.stringify(skel, null, 2));
			}

			applyValidationSnapshot(false, [...metaErrs, ...(fileRes.ok ? [] : fileRes.errors)]);
		},
		[setView],
	); // eslint-disable-line react-hooks/exhaustive-deps

	const openEdit = useCallback(
		async (diseaseName: string, patient: string): Promise<OpenEditResult> => {
			setError(null);
			setLoading(true);
			setMode("edit");
			setRubricId(diseaseName);
			setPatientLastName(patient);
			setView("form");
			setValidationVisible(false);

			try {
				const resp = await getRubricByUnique(diseaseName, patient);

				_setInstructorName(resp.instructorName ?? "");
				_setStatus(resp.status);
				_setNotes(resp.notes ?? "");

				const fileRes = validateFileUnknown(resp.file, diseaseName);
				const metaErrs = validateMeta(resp.instructorName ?? "", resp.status);

				if (fileRes.ok) {
					_setFileDraft(fileRes.canonical);
					_setRaw(JSON.stringify(fileRes.canonical, null, 2));
					applyValidationSnapshot(metaErrs.length === 0, metaErrs);
				} else {
					_setFileDraft(null);
					_setRaw(JSON.stringify(resp.file, null, 2));
					applyValidationSnapshot(false, [...metaErrs, ...fileRes.errors]);
				}

				return "ok";
			} catch (e) {
				if (isNotFoundError(e)) {
					// Do not poison editor state with a generic error, let caller decide (often openCreate).
					_setFileDraft(null);
					_setRaw("");
					applyValidationSnapshot(false, []);
					return "not_found";
				}

				setError("Failed to load rubric.");
				_setFileDraft(null);
				_setRaw("");
				applyValidationSnapshot(false, []);
				return "error";
			} finally {
				setLoading(false);
			}
		},
		[setView],
	); // eslint-disable-line react-hooks/exhaustive-deps

	const close = useCallback(() => {
		setMode("idle");
		setRubricId(null);
		setPatientLastName(null);

		_setFileDraft(null);
		_setRaw("");

		_setInstructorName("");
		_setStatus("testing");
		_setNotes("");

		setValid(false);
		setErrors([]);
		lastErrorsRef.current = [];
		lastValidRef.current = false;

		setValidationVisible(false);
		setError(null);
		setLoading(false);
		setSaving(false);
		_setView("form");
	}, []);

	const save = useCallback(
		async (opts?: { confirmReplace?: boolean }) => {
			if (!rubricId) return false;
			if (!patientLastName) return false;

			setValidationVisible(true);

			const metaErrs = validateMeta(instructorName, status);
			if (metaErrs.length) {
				applyValidationSnapshot(false, metaErrs);
				return false;
			}

			if (!fileDraft) {
				applyValidationSnapshot(false, ["file: rubric JSON is missing or invalid."]);
				return false;
			}

			const fileRes = validateFileUnknown(fileDraft, rubricId);
			if (!fileRes.ok) {
				applyValidationSnapshot(false, [...metaErrs, ...fileRes.errors]);
				return false;
			}

			const payload: RubricRequest = {
				diseaseName: rubricId,
				patientLastName: patientLastName.trim(),
				instructorName: instructorName.trim(),
				status,
				notes: notes.trim() ? notes.trim() : null,
				file: fileRes.canonical,
			};

			setSaving(true);
			setError(null);

			try {
				if (mode === "edit") {
					if (!opts?.confirmReplace) return false;
					await updateRubric(payload);
				} else if (mode === "create") {
					await addRubric(payload);
					setMode("edit");
				}

				_setFileDraft(fileRes.canonical);
				_setRaw(JSON.stringify(fileRes.canonical, null, 2));
				applyValidationSnapshot(true, []);
				return true;
			} catch (e) {
				setError("Failed to save rubric.");
				return false;
			} finally {
				setSaving(false);
			}
		},
		[rubricId, patientLastName, instructorName, status, notes, fileDraft, mode],
	); // eslint-disable-line react-hooks/exhaustive-deps

	useMemo(() => {
		if (validationVisible) setErrors(lastErrorsRef.current);
		else setErrors([]);
	}, [validationVisible]);

	return useMemo(
		() => ({
			mode,
			rubricId,
			patientLastName,

			view,
			setView,

			raw,
			setRaw,

			fileDraft,
			setFileDraft,

			instructorName,
			setInstructorName,

			status,
			setStatus,

			notes,
			setNotes,

			valid,
			errors,

			validationVisible,
			setValidationVisible,

			loading,
			saving,
			error,

			openCreate,
			openEdit,
			close,

			save,
		}),
		[
			mode,
			rubricId,
			patientLastName,
			view,
			setView,
			raw,
			setRaw,
			fileDraft,
			setFileDraft,
			instructorName,
			setInstructorName,
			status,
			setStatus,
			notes,
			setNotes,
			valid,
			errors,
			validationVisible,
			loading,
			saving,
			error,
			openCreate,
			openEdit,
			close,
			save,
		],
	);
}

export function errMsg(e: unknown): string {
	if (e instanceof ApiError) return e.message;
	if (e instanceof Error) return e.message;
	return "Something went wrong.";
}

export function usePatientLastNames() {
	const [patients, setPatients] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const xs = await getAllRubricPatients();
			const cleaned = (xs ?? []).map((s) => String(s).trim()).filter(Boolean);
			setPatients(cleaned);
		} catch (e) {
			setPatients([]);
			setError(errMsg(e));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	return { patients, loading, error, refresh };
}
