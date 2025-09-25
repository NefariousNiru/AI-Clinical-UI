// src/routes/admin/SubmissionViewer.tsx
import { useState } from "react";
import type { StudentSubmission } from "../../types/admin";
import JsonBlock from "./JsonBlock";

type Props = {
  open: boolean;
  onClose: () => void;
  submission: StudentSubmission | null;
};

function titleize(s: unknown) {
  const t = typeof s === "string" ? s : "";
  return t.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function TextSection({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 text-sm font-medium text-gray-800">{label}</div>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export default function SubmissionViewer({ open, onClose, submission }: Props) {
  const [view, setView] = useState<"formatted" | "json">("formatted");
  if (!open || !submission) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="absolute inset-x-0 top-16 mx-auto w-[min(1000px,95vw)] rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-semibold">
            Submission #{submission.id}{" "}
            {submission.synthetic ? "(synthetic)" : ""}
          </div>
          <div className="flex items-center gap-2">
            {/* tabs */}
            <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
              <button
                onClick={() => setView("formatted")}
                className={[
                  "px-3 py-1.5 text-xs",
                  view === "formatted"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                Formatted
              </button>
              <button
                onClick={() => setView("json")}
                className={[
                  "px-3 py-1.5 text-xs border-l border-gray-300",
                  view === "json"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                JSON
              </button>
            </div>
            <button
              onClick={onClose}
              className="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {view === "json" ? (
            <JsonBlock
              data={submission}
              filename={`submission-${String(
                submission?.id ?? "unknown"
              )}.json`}
            />
          ) : (
            <>
              <div className="text-sm text-gray-600">
                Problems:{" "}
                <span className="font-medium text-gray-900">
                  {Array.isArray(submission.problems)
                    ? submission.problems.length
                    : 0}
                </span>
              </div>

              {Array.isArray(submission.problems) &&
              submission.problems.length > 0 ? (
                <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
                  {submission.problems.map((p, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
                        <div className="text-sm font-semibold text-gray-800">
                          {titleize(p?.name)}
                        </div>
                        {p?.isPriority && (
                          <span className="inline-flex items-center rounded-md bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800">
                            Priority
                          </span>
                        )}
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <TextSection
                          label="Identification"
                          value={p?.identification}
                        />
                        <TextSection
                          label="Explanation"
                          value={p?.explanation}
                        />
                        <TextSection
                          label="Plan & Recommendation"
                          value={p?.planRecommendation}
                        />
                        <TextSection label="Monitoring" value={p?.monitoring} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No problems in this submission.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
