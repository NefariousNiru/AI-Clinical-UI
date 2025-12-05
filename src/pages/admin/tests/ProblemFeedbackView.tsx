// file: src/pages/admin/tests/ProblemFeedbackView.tsx

import { titleize } from "../../../lib/functions";
import type {
    ProblemFeedback,
    ProblemFeedbackList,
    DrugRelatedProblem,
    FeedbackSection,
} from "../../../lib/types/feedback";
import type { TestSubmission } from "../../../lib/types/adminTest";

type StudentAnswerProps = {
    label: string;
    value?: string | null;
};

function StudentAnswer({ label, value }: StudentAnswerProps) {
    const v = (typeof value === "string" ? value : "").trim();
    if (!v) return null;

    return (
        <section className="mb-3 rounded-xl border border-subtle bg-secondary-soft p-3">
            <h4 className="mb-1 text-xs font-semibold text-primary">{label}</h4>
            <pre className="whitespace-pre-wrap text-sm text-primary">{v}</pre>
        </section>
    );
}

type SectionProps = {
    label: string;
    studentAnswer?: string | null;
    sec?: FeedbackSection;
};

function Section({ label, studentAnswer, sec }: SectionProps) {
    const score = typeof sec?.score === "string" ? sec.score.trim() : "";
    const evaluation =
        typeof sec?.evaluation === "string" ? sec.evaluation.trim() : "";
    const feedback =
        typeof sec?.feedback === "string" ? sec.feedback.trim() : "";

    return (
        <section className="app-bg p-3">
            <header className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-primary">{label}</h3>
                {score && (
                    <span className="inline-flex items-center rounded-4xl border border-subtle bg-secondary px-2 py-0.5 text-xs font-medium text-on-secondary">
            Score: <span className="ml-1 text-on-secondary">{score}</span>
          </span>
                )}
            </header>

            <StudentAnswer label="Student answer" value={studentAnswer} />

            {evaluation && (
                <p className="mb-2 text-sm text-primary whitespace-pre-wrap">
                    <span className="font-semibold">Evaluation:</span>
                    <br />
                    {evaluation}
                </p>
            )}

            {feedback && (
                <p className="text-sm text-primary whitespace-pre-wrap">
                    <span className="font-semibold">Feedback:</span>
                    <br />
                    {feedback}
                </p>
            )}
        </section>
    );
}

type ProblemFeedbackViewProps = {
    data: ProblemFeedbackList;
    /** The test submission we graded (to surface original answers) */
    student?: TestSubmission | null;
};

export default function ProblemFeedbackView({
                                                data,
                                                student,
                                            }: ProblemFeedbackViewProps) {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <p className="text-sm text-muted" aria-live="polite">
                No feedback.
            </p>
        );
    }

    // Build a lookup from problem.name -> student problem (no casts)
    const byProblem: Record<string, DrugRelatedProblem> = {};
    if (student && Array.isArray(student.problems)) {
        for (const p of student.problems) {
            if (p && typeof p.name === "string" && p.name.trim()) {
                byProblem[p.name] = p;
            }
        }
    }

    return (
        <div className="space-y-4">
            {data.map((p: ProblemFeedback, idx: number) => {
                const problemName =
                    typeof p.name === "string" ? p.name : `Problem ${idx + 1}`;
                const stu = byProblem[problemName];

                return (
                    <article
                        key={problemName || idx}
                        className="rounded-2xl border border-subtle overflow-hidden app-bg"
                        aria-label={`Feedback for ${titleize(problemName)}`}
                    >
                        {/* Header */}
                        <header className="flex items-center justify-between border-b border-subtle px-4 py-3">
                            <h2 className="text-sm font-semibold text-on-accent-soft">
                                {(idx + 1) + ". " +  titleize(problemName)}
                            </h2>
                            {p.isPriority && (
                                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-on-secondary">
                                  Priority
                                </span>
                            )}
                        </header>

                        {/* Sections grid */}
                        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                            <Section
                                label="Identification"
                                studentAnswer={stu?.identification}
                                sec={p.identification}
                            />
                            <Section
                                label="Explanation"
                                studentAnswer={stu?.explanation}
                                sec={p.explanation}
                            />
                            <Section
                                label="Plan & Recommendation"
                                studentAnswer={stu?.planRecommendation}
                                sec={p.planRecommendation}
                            />
                            <Section
                                label="Monitoring"
                                studentAnswer={stu?.monitoring}
                                sec={p.monitoring}
                            />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
