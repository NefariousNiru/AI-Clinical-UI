// file: src/pages/admin/rubric/RubricEditorPanel.tsx

import {useEffect, useMemo, useState} from "react";
import {Loader2, Upload} from "lucide-react";
import Modal from "../../../components/Modal";
import Tabs from "../../../components/Tabs";
import type {RubricJson, RubricStatus} from "../../../lib/types/rubricSchema";
import RubricFormattedEditable from "./RubricFormattedEditable";
import {titleizeDiseaseName} from "../../../lib/utils/functions";

type Props = {
    mode: "create" | "edit";
    rubricId: string;

    view: "form" | "json";
    setView: (v: "form" | "json") => void;

    raw: string;
    setRaw: (v: string) => void;

    fileDraft: RubricJson | null;
    setFileDraft: (v: RubricJson) => void;

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

    onClose: () => void;
    onSave: (opts?: { confirmReplace?: boolean }) => Promise<boolean>;
};

export default function RubricEditorPanel(props: Props) {
    const {
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
        onClose,
        onSave,
    } = props;

    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

    const [localDraft, setLocalDraft] = useState<RubricJson | null>(fileDraft);

    useEffect(() => {
        if (fileDraft) setLocalDraft(fileDraft);
    }, [fileDraft]);

    useEffect(() => {
        setConfirmOpen(false);
        if (view === "form") setValidationVisible(false);
    }, [rubricId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

    const title = mode === "edit" ? "View/Edit rubric" : "Create rubric";
    const rubricName = titleizeDiseaseName(rubricId);
    const canInteract = !(saving || loading);

    const effectiveDraft = useMemo(
        () => (view === "form" ? localDraft : fileDraft),
        [view, localDraft, fileDraft],
    );

    const showSummary = validationVisible && !valid && errors.length > 0;

    async function onFileChange(f: File | null): Promise<void> {
        if (!f) return;
        const text = await f.text();
        setRaw(text);
        setView("json");
        setValidationVisible(true);
    }

    function prettify(): void {
        try {
            const obj = JSON.parse(raw) as unknown;
            setRaw(JSON.stringify(obj, null, 2));
        } catch {
            // ignore
        }
    }

    return (
        <section className="mt-3 rounded-[1.75rem] border border-subtle app-bg p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-primary">
                        {title}: <span className="text-secondary">{rubricName}</span>
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                        Upload a JSON file or edit using the Form/JSON tabs. Saving replaces the previous rubric.
                    </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                    <Tabs
                        value={view}
                        onChange={(v) => {
                            const next = v as "form" | "json";
                            setView(next);
                            setValidationVisible(next === "json");
                        }}
                        items={[
                            {value: "form", label: "Form"},
                            {value: "json", label: "JSON"},
                        ]}
                    />
                </div>
            </div>

            <div className="mt-3 space-y-2">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <label className="space-y-1">
                        <div className="text-[11px] font-medium text-muted">Instructor Name</div>
                        <input
                            value={instructorName}
                            onChange={(e) => setInstructorName(e.target.value)}
                            disabled={!canInteract}
                            className={[
                                "h-8 w-full rounded-3xl border bg-surface px-2 text-xs text-primary placeholder:text-muted",
                                "border-subtle",
                                !canInteract ? "opacity-50" : "",
                                "focus:outline-none focus:border-strong",
                            ].join(" ")}
                            placeholder="e.g., Dr. Smith"
                        />
                    </label>

                    <label className="space-y-1">
                        <div className="text-[11px] font-medium text-muted">Status</div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as RubricStatus)}
                            disabled={!canInteract}
                            className={[
                                "h-8 w-full rounded-3xl border bg-surface px-2 text-xs text-primary",
                                "border-subtle",
                                !canInteract ? "opacity-50" : "",
                                "focus:outline-none focus:border-strong",
                            ].join(" ")}
                        >
                            <option value="testing">testing</option>
                            <option value="completed">completed</option>
                        </select>
                    </label>

                    <label className="space-y-1 md:col-span-3">
                        <div className="text-[11px] font-medium text-muted">Notes (optional comments for the rubric; not used by LLM)</div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={!canInteract}
                            className={[
                                "min-h-[64px] w-full rounded-2xl border border-subtle bg-surface px-3 py-2",
                                "text-xs leading-relaxed text-primary placeholder:text-muted",
                                !canInteract ? "opacity-50" : "",
                                "focus:outline-none focus:border-strong",
                            ].join(" ")}
                            placeholder="Optional notes about this rubric"
                        />
                    </label>
                </div>

                <input
                    id="rubric-json"
                    type="file"
                    accept=".json,application/json,text/json"
                    className="sr-only"
                    disabled={!canInteract}
                    onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        void onFileChange(f);
                        e.target.value = "";
                    }}
                />

                <label
                    htmlFor="rubric-json"
                    className={[
                        "inline-flex w-full items-center justify-center gap-2 rounded-3xl",
                        "h-9 border border-subtle bg-secondary px-3 text-xs font-medium text-on-secondary",
                        "hover:opacity-90",
                        !canInteract ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer",
                    ].join(" ")}
                >
                    <Upload className="h-4 w-4" aria-hidden="true"/>
                    Upload JSON
                </label>

                {loading ? (
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Loader2 className="h-3 w-3 animate-spin"/>
                        <span>Loading...</span>
                    </div>
                ) : null}

                {error ? <div className="text-xs text-danger">{error}</div> : null}

                {showSummary ? (
                    <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3">
                        <div className="text-xs font-semibold text-danger">Please fix these issues</div>
                        <ul className="mt-2 list-disc space-y-1 max-h-48 overflow-auto pl-5 text-[11px] text-danger">
                            {errors.slice(0, 200).map((e, idx) => (
                                <li key={`${e}-${idx}`}>{e}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {view === "json" ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={prettify}
                                disabled={!canInteract || !raw.trim()}
                                className="h-8 rounded-4xl border border-subtle bg-surface px-3 text-[11px] font-medium text-primary hover:bg-surface-subtle disabled:opacity-60"
                            >
                                Pretty JSON
                            </button>
                        </div>

                        <textarea
                            value={raw}
                            onChange={(e) => setRaw(e.target.value)}
                            className="min-h-[340px] w-full rounded-2xl border border-subtle bg-surface px-3 py-2 font-mono text-xs leading-relaxed text-primary"
                            spellCheck={false}
                        />
                    </div>
                ) : effectiveDraft ? (
                    <RubricFormattedEditable
                        draft={effectiveDraft}
                        onChange={(next) => {
                            setLocalDraft(next);
                            setFileDraft(next);
                        }}
                    />
                ) : (
                    <div className="py-6 text-xs text-muted">No rubric loaded.</div>
                )}

                <div className="pt-3 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={!canInteract}
                        className={[
                            "h-9 rounded-3xl border border-subtle bg-surface-subtle px-4 text-xs font-semibold text-primary",
                            "hover:bg-surface focus:outline-none focus-visible:border-strong",
                            !canInteract ? "opacity-60" : "",
                        ].join(" ")}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        disabled={!canInteract || !localDraft}
                        className="h-9 rounded-3xl bg-secondary px-4 text-xs font-semibold text-on-secondary hover:opacity-90 disabled:opacity-60"
                        onClick={() => {
                            if (!valid) {
                                setValidationVisible(true);
                                return;
                            }
                            if (mode === "edit") setConfirmOpen(true);
                            else void onSave();
                        }}
                    >
                        {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create rubric"}
                    </button>
                </div>
            </div>

            <Modal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Replace existing rubric?"
                className="w-[min(520px,95vw)]"
            >
                <div className="space-y-3 text-sm">
                    <p className="text-muted">
                        This will replace the existing rubric for{" "}
                        <span className="font-semibold text-primary">{rubricName}</span>.
                    </p>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setConfirmOpen(false)}
                            className="h-8 rounded-4xl border border-subtle bg-surface-subtle px-3 text-xs font-medium text-primary hover:bg-surface"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                const ok = await onSave({confirmReplace: true});
                                if (ok) setConfirmOpen(false);
                            }}
                            className="h-8 rounded-4xl bg-secondary px-3 text-xs font-medium text-on-secondary hover:opacity-90"
                        >
                            Yes, replace
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
}

