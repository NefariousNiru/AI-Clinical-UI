// file: src/pages/admin/rubric/RubricEditorPanel.tsx

import {useState} from "react";
import {Loader2, Upload} from "lucide-react";
import Modal from "../../../components/Modal";
import Tabs from "../../../components/Tabs";
import type {RubricDraft} from "../hooks/rubric.ts";
import RubricFormattedEditable from "./RubricFormattedEditable";
import {titleizeDiseaseName} from "../../../lib/utils/functions.ts";

type Props = {
    mode: "create" | "edit";
    rubricId: string;

    view: "form" | "json";
    setView: (v: "form" | "json") => void;

    raw: string;
    setRaw: (v: string) => void;

    draft: RubricDraft | null;
    setDraft: (v: RubricDraft) => void;

    valid: boolean;
    errors: string[];

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
        draft,
        setDraft,
        valid,
        errors,
        loading,
        saving,
        error,
        onClose,
        onSave,
    } = props;

    const [confirmOpen, setConfirmOpen] = useState(false);

    async function onFileChange(f: File | null) {
        if (!f) return;
        const text = await f.text();
        setRaw(text);
    }

    function prettify() {
        try {
            const obj = JSON.parse(raw);
            setRaw(JSON.stringify(obj, null, 2));
        } catch {
            // ignore; validation shows parse error
        }
    }

    return (
        <section className="mt-3 rounded-[1.75rem] bg-input shadow-sm border border-subtle p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-primary">
                        {mode === "edit" ? "Edit rubric" : "Create rubric"}:{" "}
                        <span className="text-secondary">{titleizeDiseaseName(rubricId)}</span>
                    </h2>
                    <p className="text-xs text-muted mt-1">
                        Upload JSON or edit Form/JSON. Save will overwrite previous rubric.
                    </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                    <Tabs
                        value={view}
                        onChange={(v) => setView(v as "form" | "json")}
                        items={[
                            {value: "form", label: "Form"},
                            {value: "json", label: "JSON"},
                        ]}
                    />
                </div>
            </div>

            <div className="mt-3 space-y-2">
                <input
                    id="rubric-json"
                    type="file"
                    accept=".json,application/json,text/json"
                    className="sr-only"
                    disabled={saving || loading}
                    onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        void onFileChange(f);
                        e.target.value = "";
                    }}
                />

                <label
                    htmlFor="rubric-json"
                    className={[
                        "inline-flex items-center justify-center gap-2 rounded-3xl w-full",
                        "h-9 border border-subtle bg-secondary px-3 text-xs font-medium text-on-secondary hover:bg-surface",
                        saving || loading ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer",
                    ].join(" ")}
                >
                    <Upload className="h-4 w-4" aria-hidden="true"/>
                    Upload JSON
                </label>

                {loading ? (
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <Loader2 className="h-3 w-3 animate-spin"/>
                        <span>Loading…</span>
                    </div>
                ) : null}

                {error ? <div className="text-xs text-danger">{error}</div> : null}

                {!valid && errors.length ? (
                    <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3">
                        <div className="text-xs font-semibold text-danger">Schema validation failed</div>
                        <ul className="mt-2 list-disc pl-5 text-[11px] text-danger space-y-1 max-h-48 overflow-auto">
                            {errors.slice(0, 100).map((e, idx) => (
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
                                disabled={saving || loading || !raw.trim()}
                                className="h-8 rounded-4xl border border-subtle bg-surface-subtle px-3 text-[11px] font-medium text-primary hover:bg-surface disabled:opacity-60"
                            >
                                Prettify
                            </button>
                        </div>

                        <textarea
                            value={raw}
                            onChange={(e) => setRaw(e.target.value)}
                            className="min-h-[340px] w-full rounded-2xl border border-subtle bg-surface px-3 py-2 text-xs text-primary font-mono leading-relaxed"
                            spellCheck={false}
                        />
                    </div>
                ) : draft ? (
                    <RubricFormattedEditable draft={draft} onChange={setDraft}/>
                ) : (
                    <div className="text-xs text-muted py-6">No rubric loaded.</div>
                )}

                <div className="pt-3 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving || loading}
                        className="h-9 rounded-3xl border border-subtle bg-surface-subtle px-4 text-xs font-semibold text-primary hover:bg-surface disabled:opacity-60"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        disabled={saving || loading || !valid || !draft}
                        className="h-9 rounded-3xl bg-secondary px-4 text-xs font-semibold text-on-secondary hover:opacity-90 disabled:opacity-60"
                        onClick={() => {
                            if (mode === "edit") setConfirmOpen(true);
                            else void onSave();
                        }}
                    >
                        {saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create rubric"}
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
                        This will overwrite the existing rubric for{" "}
                        <span className="font-semibold text-primary">{titleizeDiseaseName(rubricId)}</span>.
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
