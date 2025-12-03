// file: src/routes/admin/OutputPanel.tsx

import type { TestSubmission } from "../../../lib/types/adminTest";
import type { ProblemFeedbackList } from "../../../lib/types/feedback";
import ProblemFeedbackView from "./ProblemFeedbackView.tsx";

type OutputPanelProps = {
    data: ProblemFeedbackList | null;
    message?: string;
    student?: TestSubmission | null;
};

export default function OutputPanel({
                                        data,
                                        message,
                                        student,
                                    }: OutputPanelProps) {
    const hasData = Array.isArray(data) && data.length > 0;
    const fallbackMessage =
        (message ?? "").trim() ||
        "Output will appear here after processing…";

    return (
        <section
            aria-label="Grading output"
            className="rounded-lg border border-subtle overflow-hidden bg-surface"
        >
            {/* Header bar */}
            <header className="border-b border-subtle bg-surface-subtle px-4 py-2 text-sm font-medium text-primary">
                Output
            </header>

            <div className="p-4">
                {/* Scrollable content area */}
                <div
                    className="max-h-[70vh] overflow-auto rounded-md bg-accent-soft p-4 text-base"
                    aria-live="polite"
                >
                    {hasData ? (
                        <ProblemFeedbackView
                            data={data}
                            student={student ?? null}
                        />
                    ) : (
                        <p className="text-sm text-primary whitespace-pre-wrap">
                            {fallbackMessage}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
