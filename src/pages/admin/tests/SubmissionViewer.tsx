// file: src/pages/admin/tests/SubmissionViewer.tsx

import { useState } from "react";
import type { TestSubmission } from "../../../lib/types/adminTest";
import { titleize } from "../../../lib/functions";
import Modal from "../../../components/Modal";
import Tabs from "../../../components/Tabs";
import JsonPanel from "./JsonPanel";

type SubmissionViewerProps = {
    open: boolean;
    onClose: () => void;
    submission: TestSubmission | null;
};

type TextSectionProps = {
    label: string;
    value?: string;
};

function TextSection({ label, value }: TextSectionProps) {
    if (!value) return null;

    return (
        <section className="rounded-md border border-subtle bg-surface-subtle p-3">
            <h3 className="mb-2 text-sm font-medium text-primary">{label}</h3>
            <p className="text-sm text-primary whitespace-pre-wrap">{value}</p>
        </section>
    );
}

/**
 * Modal that shows a single test submission in two views:
 * - Formatted (human-friendly)
 * - Raw JSON (for debugging / export)
 */
export default function SubmissionViewer({
                                             open,
                                             onClose,
                                             submission,
                                         }: SubmissionViewerProps) {
    const [view, setView] = useState<"formatted" | "json">("formatted");

    if (!open || !submission) return null;

    const headerRight = (
        <Tabs
            value={view}
            onChange={(v) => setView(v as "formatted" | "json")}
            items={[
                { value: "formatted", label: "Formatted" },
                { value: "json", label: "JSON" },
            ]}
        />
    );

    const problems = Array.isArray(submission.problems)
        ? submission.problems
        : [];

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={
                <>
                    Submission #{submission.id}{" "}
                    {submission.tags.length > 0 && (
                        <span className="text-xs text-muted">
              ({submission.tags.join(", ")})
            </span>
                    )}
                </>
            }
            headerRight={headerRight}
            className="w-[min(1000px,95vw)]"
        >
            {view === "json" ? (
                <JsonPanel
                    data={submission}
                    filename={`test-submission-${String(submission.id)}.json`}
                />
            ) : (
                <>
                    <p className="mb-3 text-sm text-muted">
                        Problems:{" "}
                        <span className="font-medium text-primary">
                          {problems.length}
                        </span>
                    </p>

                    {problems.length > 0 ? (
                        <div className="max-h-[70vh] space-y-4 overflow-auto pr-1">
                            {problems.map((p, idx) => (
                                <article
                                    key={`${p.name}-${idx}`}
                                    className="rounded-lg border border-subtle  overflow-hidden"
                                >
                                    <header className="flex items-center justify-between border-b border-subtle bg-surface-subtle px-4 py-2">
                                        <h3 className="text-sm font-semibold text-primary">
                                            {titleize(p.name)}
                                        </h3>
                                        {p.isPriority && (
                                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-on-secondary">
                                            Priority
                                          </span>
                                        )}
                                    </header>

                                    <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                                        <TextSection
                                            label="Identification"
                                            value={p.identification}
                                        />
                                        <TextSection
                                            label="Explanation"
                                            value={p.explanation}
                                        />
                                        <TextSection
                                            label="Plan & Recommendation"
                                            value={p.planRecommendation}
                                        />
                                        <TextSection
                                            label="Monitoring"
                                            value={p.monitoring}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted">
                            No problems in this submission.
                        </p>
                    )}
                </>
            )}
        </Modal>
    );
}
