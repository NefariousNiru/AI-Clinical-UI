import {useCallback, useMemo, useRef, useState} from "react";
import {addRubric, getRubricById, updateRubric} from "../../../lib/api/admin/rubric";
import {normalizeRubricJsonToCamel} from "../../../lib/functions";
import {RubricJsonSchema } from "../../../lib/types/rubricSchema.ts";

/**
 * This hook owns:
 * - loading/saving state
 * - raw JSON editor state
 * - draft (typed) rubric state
 * - strict validation + error formatting
 *
 * Key rule:
 * - API layer parses only the envelope; file is unknown.
 * - Hook normalizes + sanitizes + strict-parses the file.
 */

export type RubricEditorMode = "idle" | "create" | "edit";
export type RubricDraft = import("../../../lib/types/rubricSchema.ts").RubricJson;
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
 * Remove legacy/extra keys that exist in stored rubrics but are not part of
 * the authoring schema.
 *
 * Also canonicalize nulls -> absent for fields we treat as optional.
 */
function sanitizeRubricIncoming(input: unknown): unknown {
    if (Array.isArray(input)) return input.map(sanitizeRubricIncoming);
    if (typeof input !== "object" || input === null) return input;

    const obj = input as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    for (const [k, v] of Object.entries(obj)) {
        // Drop junk everywhere
        if (k === "aliases") continue;

        // These sometimes come back as null from DB
        if (k === "unitEquivalents" && v === null) continue;
        if (k === "dependsOnAny" && v === null) continue;
        if (k === "minItemsRequired" && v === null) continue;

        // "notes" exists at different levels. We only keep if it's a string.
        if (k === "notes") {
            if (typeof v !== "string") continue;
            out[k] = v;
            continue;
        }

        out[k] = sanitizeRubricIncoming(v);
    }

    return out;
}

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

    // prevent ping-pong loops when syncing raw <-> draft
    const syncingFromRawRef = useRef(false);
    const syncingFromDraftRef = useRef(false);

    const expectedId = rubricId;

    const validateAndCanonicalize = useCallback(
        (nextUnknown: unknown, expectedRubricId: string | null): RubricDraft | null => {
            // 1) normalize user/backfill formats to camel
            const camel = normalizeRubricJsonToCamel(nextUnknown);

            // 2) strip legacy keys + normalize nulls
            const sanitized = sanitizeRubricIncoming(camel);

            // 3) strict-parse
            const parsed = RubricJsonSchema.safeParse(sanitized);
            if (!parsed.success) {
                setValid(false);
                setErrors(formatIssues(parsed.error.issues as Array<{ path: PropertyKey[]; message: string }>));
                return null;
            }

            // 4) verify rubricId matches selection
            if (expectedRubricId && parsed.data.rubricId !== expectedRubricId) {
                setValid(false);
                setErrors([`rubricId: must equal selected disease slug "${expectedRubricId}", got "${parsed.data.rubricId}"`]);
                return null;
            }

            // 5) canonicalize UI state to parsed value
            setValid(true);
            setErrors([]);
            return parsed.data;
        },
        [],
    );

    const setDraft = useCallback(
        (next: RubricDraft) => {
            _setDraft(next);

            if (syncingFromRawRef.current) return;

            syncingFromDraftRef.current = true;
            _setRaw(JSON.stringify(next, null, 2));
            syncingFromDraftRef.current = false;

            const validated = validateAndCanonicalize(next, expectedId);
            if (!validated) return;

            // ensure canonical draft/raw
            _setDraft(validated);
            _setRaw(JSON.stringify(validated, null, 2));
        },
        [expectedId, validateAndCanonicalize],
    );

    const setRaw = useCallback(
        (next: string) => {
            _setRaw(next);

            if (syncingFromDraftRef.current) return;

            syncingFromRawRef.current = true;
            try {
                const parsedJson = JSON.parse(next);
                const validated = validateAndCanonicalize(parsedJson, expectedId);
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
        [expectedId, validateAndCanonicalize],
    );

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

                if (!validated) {
                    console.warn("[rubric] openEdit file failed validation (see errors state)");
                }
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
        [mode, rubricId, view, raw, setRaw, draft, setDraft, valid, errors, loading, saving, error, openCreate, openEdit, close, save],
    );
}
