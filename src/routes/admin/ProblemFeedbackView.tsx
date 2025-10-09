// src/routes/admin/ProblemFeedbackView.tsx
import { titleize } from "../../lib/functions";
import type {
  ProblemFeedbackList,
  ProblemFeedback,
  StudentSubmission,
  DrugRelatedProblem,
} from "../../types/admin";

function StudentAnswer({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const v = (typeof value === "string" ? value : "").trim();
  if (!v) return null;
  return (
    <div className="mb-3 rounded-md border border-orange-300 bg-orange-100 p-3">
      <div className="mb-1 text-xs font-semibold text-gray-700">{label}</div>
      <pre className="whitespace-pre-wrap text-sm text-gray-800">{v}</pre>
    </div>
  );
}

function Section({
  label,
  studentAnswer,
  sec,
}: {
  label: string;
  studentAnswer?: string | null;
  sec?: {
    score?: string | null;
    evaluation?: string | null;
    feedback?: string | null;
  };
}) {
  const score = typeof sec?.score === "string" ? sec!.score : "";
  const evaluation = typeof sec?.evaluation === "string" ? sec!.evaluation : "";
  const feedback = typeof sec?.feedback === "string" ? sec!.feedback : "";

  return (
    // <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
    <div className="bg-orange-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-orange-800">{label}</div>
        {score && (
          <span className="inline-flex items-center rounded-md border border-orange-300 bg-white px-2 py-0.5 text-xs font-medium text-orange-700">
            Score: {score}
          </span>
        )}
      </div>

      {/* Student's original answer for this section */}
      <StudentAnswer label="Student Answer" value={studentAnswer} />

      {/* Grader evaluation & feedback */}
      {evaluation && (
        <p className="mb-2 text-sm text-gray-800 whitespace-pre-wrap">
          <b>Evaluation: </b>
          <br />
          {evaluation}
        </p>
      )}
      {feedback && (
        <p className="text-sm text-gray-800 whitespace-pre-wrap">
          <b>Feedback: </b>
          <br />
          {feedback}
        </p>
      )}
    </div>
  );
}

export default function ProblemFeedbackView({
  data,
  student,
}: {
  data: ProblemFeedbackList;
  /** The student submission we graded (to surface original answers) */
  student?: StudentSubmission | null;
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-sm text-gray-500">No feedback.</div>;
  }

  // Build a quick lookup from problem.name -> student problem
  const byProblem: Record<string, DrugRelatedProblem> = {};
  if (student && Array.isArray(student.problems)) {
    for (const p of student.problems) {
      if (p?.name) byProblem[p.name] = p;
    }
  }

  return (
    <div className="space-y-4">
      {data.map((p: ProblemFeedback, idx: number) => {
        const stu = byProblem[p?.name ?? ""] || ({} as DrugRelatedProblem);
        return (
          <div
            key={idx}
            className="rounded-lg border border-orange-300 overflow-hidden"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-orange-300 bg-orange-50 px-4 py-2">
              <div className="text-sm font-semibold text-orange-800">
                {titleize(p?.name)}
              </div>
              {p.isPriority && (
                <span className="inline-flex items-center rounded-md bg-orange-200 px-2 py-0.5 text-xs font-medium text-orange-900">
                  Priority
                </span>
              )}
            </div>

            {/* sections */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Section
                label="Identification"
                studentAnswer={stu?.identification}
                sec={p?.identification}
              />
              <Section
                label="Explanation"
                studentAnswer={stu?.explanation}
                sec={p?.explanation}
              />
              <Section
                label="Plan & Recommendation"
                studentAnswer={stu?.planRecommendation}
                sec={p?.planRecommendation}
              />
              <Section
                label="Monitoring"
                studentAnswer={stu?.monitoring}
                sec={p?.monitoring}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
