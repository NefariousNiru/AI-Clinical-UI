// src/routes/admin/ProblemFeedbackView.tsx
import type { ProblemFeedbackList, ProblemFeedback } from "../../types/admin"

function titleize(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())
}
function Section({
  label,
  sec
}: {
  label: string
  sec: { score: string; evaluation: string; feedback: string }
}) {
  return (
    <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-orange-800">{label}</div>
        {sec.score && (
          <span className="inline-flex items-center rounded-md border border-orange-300 bg-white px-2 py-0.5 text-xs font-medium text-orange-700">
            Score: {sec.score}
          </span>
        )}
      </div>
      {sec.evaluation && (
        <p className="mb-2 text-sm text-gray-800 whitespace-pre-wrap"><b>Evaluation: </b><br/>{sec.evaluation}</p>
      )}
      {sec.feedback && (
        <p className="text-sm text-gray-800 whitespace-pre-wrap"><b>Feedback: </b><br/>{sec.feedback}</p>
      )}
    </div>
  )
}

export default function ProblemFeedbackView({ data }: { data: ProblemFeedbackList }) {
  if (!data?.length) return <div className="text-sm text-gray-500">No feedback.</div>

  return (
    <div className="space-y-4">
      {data.map((p: ProblemFeedback, idx: number) => (
        <div key={idx} className="rounded-lg border border-orange-300 overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between border-b border-orange-300 bg-orange-50 px-4 py-2">
            <div className="text-sm font-semibold text-orange-800">{titleize(p.name)}</div>
            {p.isPriority && (
              <span className="inline-flex items-center rounded-md bg-orange-200 px-2 py-0.5 text-xs font-medium text-orange-900">
                Priority
              </span>
            )}
          </div>

          {/* sections */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Section label="Identification" sec={p.identification} />
            <Section label="Explanation" sec={p.explanation} />
            <Section label="Plan & Recommendation" sec={p.planRecommendation} />
            <Section label="Monitoring" sec={p.monitoring} />
          </div>
        </div>
      ))}
    </div>
  )
}
