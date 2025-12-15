import {useCallback, useMemo, useRef, useState} from "react";
import {addRubric, getRubricById, updateRubric} from "../../../lib/api/admin/rubric";
import {normalizeRubricJsonToCamel} from "../../../lib/utils/functions";
import {RubricJsonSchema} from "../../../lib/types/rubricSchema";

/**
 * Rubric Editor Hook
 *
 * Responsibilities:
 * - Owns editor state (mode, selected rubricId, view, raw JSON, draft object)
 * - Loads/saves via API
 * - Normalizes incoming/outgoing rubric JSON to camelCase
 * - Sanitizes legacy DB fields that are not part of the authoring schema
 * - Validates using strict Zod schema and exposes human-readable errors
 *
 * Design:
 * - API layer parses the response envelope; the rubric "file" is treated as unknown.
 * - This hook canonicalizes the file into a strict RubricDraft for both "form" and "json" modes.
 * - raw and draft are kept in sync; we avoid ping-pong loops using refs.
 */

export type RubricEditorMode = "idle" | "create" | "edit";
export type RubricDraft = import("../../../lib/types/rubricSchema").RubricJson;

export type UseRubricEditorResult = {
    mode: RubricEditorMode;
    rubricId: string | null;

    view: "form" | "json";
    setView: (v: "form" | "json") => void;

    raw: string;
    setRaw: (next: string) => void;

    draft: RubricDraft | null;
    setDraft: (next: RubricDraft) => void;

    valid: boolean;
    errors: string[];

    loading: boolean;
    saving: boolean;
    error: string | null;

    openCreate: (rubricId: string) => void;
    openEdit: (rubricId: string) => Promise<void>;
    close: () => void;

    save: (opts?: { confirmReplace?: boolean }) => Promise<boolean>;
};

function pathToString(path: PropertyKey[]): string {
    if (!path.length) return "(root)";
    return path
        .map((p) => {
            if (typeof p === "symbol") return p.description ? `Symbol(${p.description})` : "Symbol(?)";
            return String(p);
        })
        .join(".");
}

function formatIssues(issues: Array<{ path: PropertyKey[]; message: string }>): string[] {
    return issues.map((i) => `${pathToString(i.path)}: ${i.message}`);
}

/**
 * Sanitizes incoming rubric JSON (from DB or user upload) to fit the authoring schema.
 *
 * Rules:
 * - Drop legacy keys not in schema (example: "aliases")
 * - Drop null-valued optional-ish fields that older rubrics stored as null
 * - Keep "notes" only when it's a string (older data may store null/object)
 *
 * Important:
 * - This does NOT "fix" semantically invalid rubrics. It only removes known garbage.
 * - Strict Zod validation still decides validity.
 */
function sanitizeRubricIncoming(input: unknown): unknown {
    if (Array.isArray(input)) return input.map(sanitizeRubricIncoming);
    if (typeof input !== "object" || input === null) return input;

    const obj = input as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(obj)) {
        // Drop legacy/unmodeled keys
        if (k === "aliases") continue;

        // Optional fields that older rubrics sometimes persisted as null
        if (k === "unitEquivalents" && v === null) continue;
        if (k === "dependsOnAny" && v === null) continue;
        if (k === "minItemsRequired" && v === null) continue;

        // notes exists at multiple levels. Authoring schema treats it as string when present.
        if (k === "notes") {
            if (typeof v !== "string") continue;
            out[k] = v;
            continue;
        }

        out[k] = sanitizeRubricIncoming(v);
    }

    return out;
}

/**
 * Minimal starter rubric for create flow.
 * The four sections remain constant, but blocks/criteria can evolve.
 *
 * Note: maxPoints are allowed to start at 0. If you later add derived-point logic,
 * this skeleton still remains compatible.
 */
function makeSkeletonRubric(rubricId: string): RubricDraft {
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

export function useRubricEditor(): UseRubricEditorResult {
    const [mode, setMode] = useState<RubricEditorMode>("idle");
    const [rubricId, setRubricId] = useState<string | null>(null);

    const [view, setView] = useState<"form" | "json">("form");

    const [raw, _setRaw] = useState("");
    const [draft, _setDraft] = useState<RubricDraft | null>(null);

    const [errors, setErrors] = useState<string[]>([]);
    const [valid, setValid] = useState(false);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prevent raw<->draft ping-pong loops
    const syncingFromRawRef = useRef(false);
    const syncingFromDraftRef = useRef(false);

    /**
     * Normalize + sanitize + strict-parse a rubric JSON payload.
     * Returns canonical RubricDraft on success, otherwise null and sets errors state.
     */
    const validateAndCanonicalize = useCallback(
        (nextUnknown: unknown, expectedRubricId: string | null): RubricDraft | null => {
            // 1) normalize user/backfill formats to camelCase
            const camel = normalizeRubricJsonToCamel(nextUnknown);

            // 2) strip legacy keys + normalize nulls
            const sanitized = sanitizeRubricIncoming(camel);

            // 3) strict parse
            const parsed = RubricJsonSchema.safeParse(sanitized);
            if (!parsed.success) {
                setValid(false);
                setErrors(formatIssues(parsed.error.issues as Array<{ path: PropertyKey[]; message: string }>));
                return null;
            }

            // 4) verify rubricId matches selected disease slug
            if (expectedRubricId && parsed.data.rubricId !== expectedRubricId) {
                setValid(false);
                setErrors([
                    `rubricId: must equal selected disease slug "${expectedRubricId}", got "${parsed.data.rubricId}"`,
                ]);
                return null;
            }

            // 5) mark valid and return canonical payload
            setValid(true);
            setErrors([]);
            return parsed.data;
        },
        [],
    );

    /**
     * Set draft object (form mode).
     * We update raw JSON to a canonical pretty-printed version and then re-validate.
     */
    const setDraft = useCallback(
        (next: RubricDraft) => {
            _setDraft(next);
            if (syncingFromRawRef.current) return;

            syncingFromDraftRef.current = true;
            _setRaw(JSON.stringify(next, null, 2));
            syncingFromDraftRef.current = false;

            const validated = validateAndCanonicalize(next, rubricId);
            if (!validated) return;

            // enforce canonical object + raw text
            _setDraft(validated);
            _setRaw(JSON.stringify(validated, null, 2));
        },
        [rubricId, validateAndCanonicalize],
    );

    /**
     * Set raw JSON (json mode).
     * We parse the JSON and re-validate into a canonical RubricDraft.
     */
    const setRaw = useCallback(
        (next: string) => {
            _setRaw(next);
            if (syncingFromDraftRef.current) return;

            syncingFromRawRef.current = true;
            try {
                const parsedJson = JSON.parse(next);
                const validated = validateAndCanonicalize(parsedJson, rubricId);

                _setDraft(validated);
                if (validated) _setRaw(JSON.stringify(validated, null, 2));
            } catch {
                setValid(false);
                setErrors(["(root): Invalid JSON (failed to parse)."]);
                _setDraft(null);
            } finally {
                syncingFromRawRef.current = false;
            }
        },
        [rubricId, validateAndCanonicalize],
    );

    /**
     * Create mode: new skeleton + validate immediately.
     */
    const openCreate = useCallback(
        (id: string) => {
            setError(null);
            setMode("create");
            setRubricId(id);
            setView("form");

            const skel = makeSkeletonRubric(id);
            const validated = validateAndCanonicalize(skel, id);

            _setDraft(validated);
            _setRaw(JSON.stringify(validated ?? skel, null, 2));
        },
        [validateAndCanonicalize],
    );

    /**
     * Edit mode: load from backend and validate the file payload strictly.
     */
    const openEdit = useCallback(
        async (id: string) => {
            console.log("[rubric] openEdit", {id});

            setError(null);
            setLoading(true);
            setMode("edit");
            setRubricId(id);
            setView("form");

            try {
                const resp = await getRubricById(id);
                console.log("[rubric] getRubricById resp", resp);

                const fileUnknown = resp.file;
                const validated = validateAndCanonicalize(fileUnknown, id);

                _setDraft(validated);
                _setRaw(validated ? JSON.stringify(validated, null, 2) : JSON.stringify(fileUnknown, null, 2));

                if (!validated) console.warn("[rubric] openEdit: file failed validation");
            } catch (e) {
                console.error("[rubric] openEdit failed:", e);
                setError("Failed to load rubric.");
                _setDraft(null);
                _setRaw("");
                setValid(false);
                setErrors([]);
            } finally {
                setLoading(false);
            }
        },
        [validateAndCanonicalize],
    );

    /**
     * Close editor and reset state.
     */
    const close = useCallback(() => {
        setMode("idle");
        setRubricId(null);
        _setDraft(null);
        _setRaw("");
        setValid(false);
        setErrors([]);
        setError(null);
        setLoading(false);
        setSaving(false);
    }, []);

    /**
     * Save rubric using current mode.
     * - edit: requires confirmReplace
     * - create: adds then switches to edit mode
     */
    const save = useCallback(
        async (opts?: { confirmReplace?: boolean }) => {
            if (!draft || !rubricId) return false;
            if (!valid) return false;
            if (draft.rubricId !== rubricId) return false;

            setSaving(true);
            setError(null);

            try {
                if (mode === "edit") {
                    if (!opts?.confirmReplace) return false;
                    await updateRubric(draft);
                } else if (mode === "create") {
                    await addRubric(draft);
                    setMode("edit");
                }
                return true;
            } catch (e) {
                console.error("[rubric] save failed:", e);
                setError("Failed to save rubric.");
                return false;
            } finally {
                setSaving(false);
            }
        },
        [draft, rubricId, valid, mode],
    );

    return useMemo(
        () => ({
            mode,
            rubricId,

            view,
            setView,

            raw,
            setRaw,

            draft,
            setDraft,

            valid,
            errors,

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
            raw,
            setRaw,
            draft,
            setDraft,
            valid,
            errors,
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
