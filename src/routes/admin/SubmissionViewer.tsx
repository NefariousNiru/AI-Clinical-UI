// src/routes/admin/SubmissionViewer.tsx
import { useState } from "react";
import type { StudentSubmission } from "../../types/admin";
import JsonBlock from "./JsonBlock";
import { titleize } from "../../lib/functions";
import Modal from "../../components/ui/Modal";
import Tabs from "../../components/ui/Tabs";

/*
1) Purpose: View a single submission in a modal with 2 modes: formatted and JSON.
2) Data: Expects a StudentSubmission or null, controlled open flag, and close handler.
3) UI: Uses shared <Modal> and <Tabs> for consistent behavior across the app.
4) Flow: If no data or not open -> null; else render header + tab switch + content.
*/

type Props = {
  open: boolean;
  onClose: () => void;
  submission: StudentSubmission | null;
};

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          Submission #{submission.id}{" "}
          {submission.synthetic ? "(synthetic)" : ""}
        </>
      }
      headerRight={headerRight}
    >
      {view === "json" ? (
        <JsonBlock
          data={submission}
          filename={`submission-${String(submission?.id ?? "unknown")}.json`}
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
                    <TextSection label="Explanation" value={p?.explanation} />
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
    </Modal>
  );
}
