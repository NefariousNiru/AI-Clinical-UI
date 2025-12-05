// file: src/pages/admin/tests/TestsPage.tsx

import { useMemo, useState } from "react";
import PromptEditor from "./PromptEditor";
import OutputPanel from "./OutputPanel";
import SubmissionList from "./SubmissionList";
import SubmissionViewer from "./SubmissionViewer";

import { useSubmissions } from "../hooks/useSubmissions";
import { useTestUI } from "../hooks/useTestUI.ts";

import type { ProblemFeedback } from "../../../lib/types/feedback";
import type { TestSubmission } from "../../../lib/types/adminTest";

import { chat } from "../../../lib/api/admin/test";
import { ApiError } from "../../../lib/api/http";
// import { saveSession } from "../../../lib/localSession";
import * as React from "react";
import { BrainCircuit } from "lucide-react";

/**
 * Normalize errors for this page into a user-facing string.
 */
function errorMessage(e: unknown): string {
    if (e instanceof ApiError) return e.message || "Request failed.";
    if (e instanceof Error) return e.message || "Request failed.";
    return "Request failed.";
}

export default function TestsPage() {
    // 1) UI config from /api/v1/admin/test/populate_ui
    const {
        systemPrompt,
        setSystemPrompt,
        modelNames,
        selectedModel,
        setSelectedModel,
        loading: loadingUi,
        error: uiError,
    } = useTestUI();

    // 2) Test submissions list
    const {
        items: subs,
        total,
        page,
        limit,
        loading: loadingSubs,
        setPage,
    } = useSubmissions(1, 10);

    const [selectedId, setSelectedId] = useState<number | null>(null);

    // 3) Submission viewer modal
    const [viewerOpen, setViewerOpen] = useState<boolean>(false);
    const [viewerData, setViewerData] = useState<TestSubmission | null>(null);

    // 4) Grading output
    const [feedback, setFeedback] = useState<ProblemFeedback[] | null>(null);
    const [outputMsg, setOutputMsg] = useState<string>("");
    const [sending, setSending] = useState<boolean>(false);

    // 5) Local save status
    const [saveMsg, setSaveMsg] = useState<string>("");

    const [gradedSubmission, setGradedSubmission] =
        useState<TestSubmission | null>(null);

    const modelsUnavailable = modelNames.length === 0;

    // 6) Adapt submissions for the sidebar list
    const listItems = useMemo(
        () =>
            subs.map((s: TestSubmission) => ({
                id: s.id,
                title: `Test #${s.id}`,
                subtitle: s.tags.join(", "),
            })),
        [subs],
    );

    // 7) Grade current selection
    async function handleSend(): Promise<void> {
        const sub: TestSubmission | undefined =
            selectedId != null
                ? subs.find((s: TestSubmission) => s.id === selectedId)
                : undefined;

        if (!sub) {
            setFeedback(null);
            setOutputMsg(
                "Select a submission from the list on the right, then press Send.",
            );
            return;
        }

        if (!selectedModel) {
            setFeedback(null);
            setOutputMsg("No model selected.");
            return;
        }

        setSending(true);
        setFeedback(null);
        setOutputMsg("Processing…");
        setGradedSubmission(sub);

        try {
            const resp = await chat({
                testSubmission: sub,
                systemPrompt,
                modelName: selectedModel,
            });

            setFeedback(resp.results);
            setOutputMsg("");
        } catch (e: unknown) {
            setFeedback(null);
            setOutputMsg(errorMessage(e));
        } finally {
            setSending(false);
        }
    }

    // 8) Save-guard
    function canSave():
        | { ok: true }
        | { ok: false; reason: string } {
        if (!systemPrompt.trim()) {
            return { ok: false, reason: "System prompt is empty." };
        }
        if (selectedId == null) {
            return { ok: false, reason: "No submission selected." };
        }
        if (!Array.isArray(feedback) || feedback.length === 0) {
            return { ok: false, reason: "No output to save." };
        }
        if (gradedSubmission == null) {
            return { ok: false, reason: "No graded submission context." };
        }
        return { ok: true };
    }

    // 9) Save current run locally
    function handleSaveLocal(): void {
        if (modelsUnavailable) {
            setFeedback(null);
            setOutputMsg("No models available.");
            return;
        }

        const v = canSave();
        if (!v.ok) {
            setSaveMsg(v.reason);
            window.setTimeout(() => setSaveMsg(""), 5000)
            return;
        }

        // const sub = gradedSubmission as TestSubmission;
        // const fb = feedback as ProblemFeedback[];

        // saveSession({
        //     model: selectedModel,
        //     systemPrompt,
        //     submissionId: sub.id,
        //     submission: sub,
        //     feedback: fb,
        // });

        setSaveMsg("Saved ✓");
        window.setTimeout(() => setSaveMsg(""), 1500);
    }

    return (
        <div className="grid grid-cols-12 gap-8 px-4 lg:px-6 text-primary">
            {/* Main column */}
            <section className="col-span-12 xl:col-span-10 space-y-6">
                <header className="space-y-3">
                    {/* Top row: title + actions (stack on small, row on md+) */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        {/* Title */}
                        <div>
                            <h1 className="text-xl font-semibold">System Prompt</h1>
                        </div>

                        {/* Actions: model select + save local */}
                        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
                            {/* Model select */}
                            <label className="flex items-center gap-2 text-sm font-medium text-primary">
                                <BrainCircuit className="h-4 w-4" aria-hidden="true" />
                                <span>Model:</span>
                                <div className="relative">
                                    <select
                                        value={selectedModel}
                                        onChange={(ev: React.ChangeEvent<HTMLSelectElement>) =>
                                            setSelectedModel(ev.target.value)
                                        }
                                        disabled={loadingUi || modelsUnavailable}
                                        className={[
                                            "h-9 rounded-lg border border-secondary bg-input pl-3 pr-8 text-sm",
                                            "focus-visible:outline focus-visible:outline-offset-2",
                                        ].join(" ")}
                                        aria-label="Select model"
                                    >
                                        {modelsUnavailable ? (
                                            <option value="" disabled>
                                                No models available
                                            </option>
                                        ) : (
                                            modelNames.map((name: string) => (
                                                <option key={name} value={name}>
                                                    {name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </label>

                            {/* Save local */}
                            <button
                                type="button"
                                onClick={handleSaveLocal}
                                className={[
                                    "h-10 rounded-md px-4 text-sm font-medium bg-accent text-on-accent",
                                    "hover:opacity-90 disabled:opacity-60",
                                ].join(" ")}
                            >
                                Save local
                            </button>
                        </div>
                    </div>

                    {/* Status / error messages: always below actions */}
                    <div className="space-y-1">
                        {loadingUi && (
                            <p className="text-sm text-muted">Loading configuration…</p>
                        )}

                        {uiError && (
                            <p
                                className="text-xs text-danger max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                role="alert"
                            >
                                {uiError}
                            </p>
                        )}

                        {saveMsg && (
                            <p className="text-xs text-muted" aria-live="polite">
                                {saveMsg}
                            </p>
                        )}
                    </div>
                </header>


                <PromptEditor
                    value={systemPrompt}
                    onChange={setSystemPrompt}
                    onSend={handleSend}
                    sending={sending}
                />

                <OutputPanel
                    data={feedback}
                    message={outputMsg}
                    student={gradedSubmission}
                />
            </section>

            {/* Sidebar */}
            <aside
                aria-label="Test Submissions list"
                className="col-span-12 xl:col-span-2 xl:pr-0">
                <div className="xl:sticky xl:top-16">
                    <SubmissionList
                        items={listItems}
                        total={total}
                        page={page}
                        pageSize={limit}
                        onSelect={(id: unknown) => {
                            const numericId =
                                typeof id === "number" ? id : Number(id);
                            setSelectedId(
                                Number.isFinite(numericId) ? numericId : null,
                            );
                        }}
                        onPageChange={(p: number) => {
                            setPage(p);
                        }}
                        onView={(id: unknown) => {
                            const numericId =
                                typeof id === "number" ? id : Number(id);
                            if (!Number.isFinite(numericId)) return;

                            const match = subs.find(
                                (x: TestSubmission) => x.id === numericId,
                            );
                            if (match) {
                                setViewerData(match);
                                setViewerOpen(true);
                            }
                        }}
                    />
                    {loadingSubs && (
                        <p className="px-3 py-2 text-xs text-muted">
                            Loading submissions…
                        </p>
                    )}
                </div>
            </aside>

            <SubmissionViewer
                open={viewerOpen}
                submission={viewerData}
                onClose={() => setViewerOpen(false)}
            />
        </div>
    );
}
