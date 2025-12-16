// file: src/pages/admin/hooks/rubric.ts

import {useCallback, useMemo, useRef, useState} from "react";
import {addRubric, getRubricById, updateRubric} from "../../../lib/api/admin/rubric";
import {
    RubricJsonSchema,
    RubricStatusSchema,
    type RubricJson,
    type RubricStatus
} from "../../../lib/types/rubricSchema";
import {canonicalizeAndValidate} from "../../../lib/utils/rubricEdit";

export type RubricEditorMode = "idle" | "create" | "edit";

export type UseRubricEditorResult = {
    mode: RubricEditorMode;
    rubricId: string | null;

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

    openCreate: (rubricId: string) => void;
    openEdit: (rubricId: string) => Promise<void>;
    close: () => void;

    save: (opts?: { confirmReplace?: boolean }) => Promise<boolean>;
};

function makeSkeletonFile(rubricId: string): RubricJson {
    return {
        rubricId,
        rubricVersion: "1.0",
        schemaVersion: "1.0",
        scoringInvariants: {
            requireSectionBlockSumsMatch: true,
            evidenceScope: "section",
            notes: "Scope limited to section.",
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

function formatIssues(issues: Array<{ path: string; message: string }>): string[] {
    return issues.map((i) => `${i.path}: ${i.message}`);
}

function formatZodIssues(
    issues: Array<{ path: Array<string | number>; message: string }>,
): string[] {
    return issues.map((i) => {
        const path = i.path.length ? i.path.join(".") : "(root)";
        return `${path}: ${i.message}`;
    });
}

type ValidationResult =
    | { ok: true; canonical: RubricJson; errors: string[] }
    | { ok: false; canonical: null; errors: string[] };

function validateFileUnknown(nextUnknown: unknown, expectedRubricId: string | null): ValidationResult {
    const parsed = RubricJsonSchema.safeParse(nextUnknown);
    if (!parsed.success) {
        return {
            ok: false,
            canonical: null,
            errors: formatZodIssues(
                parsed.error.issues.map((x) => ({path: x.path as Array<string | number>, message: x.message})),
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

    const {draft: canonical, issues} = canonicalizeAndValidate(parsed.data);
    if (issues.length) return {ok: false, canonical: null, errors: formatIssues(issues)};

    return {ok: true, canonical, errors: []};
}

export function useRubricEditor(): UseRubricEditorResult {
    const [mode, setMode] = useState<RubricEditorMode>("idle");
    const [rubricId, setRubricId] = useState<string | null>(null);

    const [view, _setView] = useState<"form" | "json">("form");
    const [raw, _setRaw] = useState<string>("");

    const [fileDraft, _setFileDraft] = useState<RubricJson | null>(null);

    const [instructorName, setInstructorName] = useState<string>("");
    const [status, setStatus] = useState<RubricStatus>("testing");
    const [notes, setNotes] = useState<string>("");

    const [valid, setValid] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [validationVisible, setValidationVisible] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const syncingFromRawRef = useRef<boolean>(false);
    const syncingFromDraftRef = useRef<boolean>(false);

    const lastErrorsRef = useRef<string[]>([]);
    const lastValidRef = useRef<boolean>(false);

    const applyValidationSnapshot = useCallback(
        (v: boolean, errs: string[]) => {
            lastValidRef.current = v;
            lastErrorsRef.current = errs;

            setValid(v);
            setErrors(validationVisible ? errs : []);
        },
        [validationVisible],
    );

    const setView = useCallback((v: "form" | "json") => {
        _setView(v);
        setValidationVisible(v === "json");
    }, []);

    const setFileDraft = useCallback(
        (next: RubricJson) => {
            // Always keep the user's latest object in state.
            _setFileDraft(next);

            if (syncingFromRawRef.current) {
                applyValidationSnapshot(lastValidRef.current, lastErrorsRef.current);
                return;
            }

            const res = validateFileUnknown(next, rubricId);
            if (res.ok) {
                _setFileDraft(res.canonical);

                syncingFromDraftRef.current = true;
                _setRaw(JSON.stringify(res.canonical, null, 2));
                syncingFromDraftRef.current = false;

                applyValidationSnapshot(true, []);
            } else {
                // Keep draft editable, but do not spam errors in Form view.
                syncingFromDraftRef.current = true;
                _setRaw(JSON.stringify(next, null, 2));
                syncingFromDraftRef.current = false;

                applyValidationSnapshot(false, res.errors);
            }
        },
        [applyValidationSnapshot, rubricId],
    );

    const setRaw = useCallback(
        (next: string) => {
            _setRaw(next);
            if (syncingFromDraftRef.current) return;

            syncingFromRawRef.current = true;
            try {
                const parsedJson: unknown = JSON.parse(next);
                const res = validateFileUnknown(parsedJson, rubricId);

                if (res.ok) {
                    _setFileDraft(res.canonical);
                    _setRaw(JSON.stringify(res.canonical, null, 2));
                    applyValidationSnapshot(true, []);
                } else {
                    // Keep last good fileDraft for Form view; JSON view shows errors.
                    applyValidationSnapshot(false, res.errors);
                }
            } catch {
                applyValidationSnapshot(false, ["(root): Invalid JSON (failed to parse)."]);
            } finally {
                syncingFromRawRef.current = false;
            }
        },
        [applyValidationSnapshot, rubricId],
    );

    const openCreate = useCallback(
        (id: string) => {
            setError(null);
            setMode("create");
            setRubricId(id);
            setView("form");
            setValidationVisible(false);

            setInstructorName("");
            setStatus("testing");
            setNotes("");

            const skel = makeSkeletonFile(id);
            const res = validateFileUnknown(skel, id);

            if (res.ok) {
                _setFileDraft(res.canonical);
                _setRaw(JSON.stringify(res.canonical, null, 2));
                applyValidationSnapshot(true, []);
            } else {
                _setFileDraft(skel);
                _setRaw(JSON.stringify(skel, null, 2));
                applyValidationSnapshot(false, res.errors);
            }
        },
        [applyValidationSnapshot, setView],
    );

    const openEdit = useCallback(
        async (id: string) => {
            setError(null);
            setLoading(true);
            setMode("edit");
            setRubricId(id);
            setView("form");
            setValidationVisible(false);

            try {
                const resp = await getRubricById(id);

                setInstructorName(resp.instructorName ?? "");
                setStatus(RubricStatusSchema.parse(resp.status));
                setNotes(resp.notes ?? "");

                const res = validateFileUnknown(resp.file, id);
                if (res.ok) {
                    _setFileDraft(res.canonical);
                    _setRaw(JSON.stringify(res.canonical, null, 2));
                    applyValidationSnapshot(true, []);
                } else {
                    // Keep the file in raw (for inspection), but Form uses fileDraft.
                    _setFileDraft(resp.file);
                    _setRaw(JSON.stringify(resp.file, null, 2));
                    applyValidationSnapshot(false, res.errors);
                }
            } catch (e: unknown) {
                // eslint-disable-next-line no-console
                console.error("[rubric] openEdit failed:", e);
                setError("Failed to load rubric.");
                _setFileDraft(null);
                _setRaw("");
                applyValidationSnapshot(false, []);
            } finally {
                setLoading(false);
            }
        },
        [applyValidationSnapshot, setView],
    );

    const close = useCallback(() => {
        setMode("idle");
        setRubricId(null);

        _setFileDraft(null);
        _setRaw("");

        setInstructorName("");
        setStatus("testing");
        setNotes("");

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
            if (!rubricId || !fileDraft) return false;

            // Force surfacing issues on save attempt.
            setValidationVisible(true);

            const metaInstructor = instructorName.trim();
            if (!metaInstructor) {
                applyValidationSnapshot(false, ["instructorName: is required."]);
                return false;
            }

            const res = validateFileUnknown(fileDraft, rubricId);
            if (!res.ok) {
                applyValidationSnapshot(false, res.errors);
                return false;
            }

            setSaving(true);
            setError(null);

            try {
                const payload = {
                    diseaseName: rubricId,
                    instructorName: metaInstructor,
                    status,
                    notes: notes.trim() ? notes.trim() : null,
                    file: res.canonical,
                } as const;

                if (mode === "edit") {
                    if (!opts?.confirmReplace) return false;
                    const resp = await updateRubric(payload);
                    _setFileDraft(resp.file);
                    _setRaw(JSON.stringify(resp.file, null, 2));
                } else if (mode === "create") {
                    const resp = await addRubric(payload);
                    setMode("edit");
                    _setFileDraft(resp.file);
                    _setRaw(JSON.stringify(resp.file, null, 2));
                }

                applyValidationSnapshot(true, []);
                return true;
            } catch (e: unknown) {
                // eslint-disable-next-line no-console
                console.error("[rubric] save failed:", e);
                setError("Failed to save rubric.");
                return false;
            } finally {
                setSaving(false);
            }
        },
        [
            rubricId,
            fileDraft,
            instructorName,
            status,
            notes,
            mode,
            applyValidationSnapshot,
        ],
    );

    return useMemo(
        () => ({
            mode,
            rubricId,

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
            view,
            setView,
            raw,
            setRaw,
            fileDraft,
            setFileDraft,
            instructorName,
            status,
            notes,
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
