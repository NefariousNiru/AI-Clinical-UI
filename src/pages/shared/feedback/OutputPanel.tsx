// file: src/pages/shared/feedback/OutputPanel.tsx

import type { TestSubmission } from "../../../lib/types/test.ts";
import type { ProblemFeedbackList } from "../../../lib/types/feedback.ts";
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
            className="rounded-3xl border border-subtle overflow-hidden"
        >
            {/* Header bar */}
            <header className="border-strong bg-accent px-4 py-3 text-sm font-medium text-on-accent">
                Output
            </header>

            {/* Scrollable content area with Student answer and LLM Feedback*/}
            <div
                className="textarea-scroll max-h-[80vh] overflow-auto rounded-3xl app-bg p-4 text-primary"
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


        </section>
    );
}
