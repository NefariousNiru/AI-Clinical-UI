// src/routes/admin/OutputPanel.tsx
import type { ProblemFeedbackList, StudentSubmission } from "../../types/admin";
import ProblemFeedbackView from "./ProblemFeedbackView";

type Props = {
  data?: ProblemFeedbackList | null;
  message?: string;
  student?: StudentSubmission | null;
};

export default function OutputPanel({ data, message, student }: Props) {
  const hasData = Array.isArray(data) && data.length > 0;
  return (
    <div className="rounded-lg border border-orange-300 overflow-hidden">
      <div className="border-b border-orange-300 bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800">
        Output
      </div>
      <div className="p-4">
        {/* scrollable content area */}
        <div className="max-h-[70vh] overflow-auto rounded-md bg-orange-50 p-4 text-base">
          {hasData ? (
            <ProblemFeedbackView data={data as ProblemFeedbackList} student={student ?? null}/>
          ) : (
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {(message ?? "").trim() ||
                "Output will appear here after processing..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
