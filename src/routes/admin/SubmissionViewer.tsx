import type { StudentSubmission } from "../../types/admin";

type Props = {
  open: boolean;
  onClose: () => void;
  submission: StudentSubmission | null;
};

export default function SubmissionViewer({ open, onClose, submission }: Props) {
  if (!open || !submission) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="absolute inset-x-0 top-16 mx-auto w-[min(900px,95vw)] rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-semibold">
            Submission #{submission.id}{" "}
            {submission.synthetic ? "(synthetic)" : ""}
          </div>
          <button
            onClick={onClose}
            className="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="text-sm text-gray-600">
            Problems:{" "}
            <span className="font-medium text-gray-900">
              {submission.problems?.length ?? 0}
            </span>
          </div>

          {/* raw view for now; we’ll replace with a pretty renderer once you share the DRP schema */}
          <div className="h-[60vh] overflow-auto rounded-md bg-gray-50 p-4 text-sm text-gray-800">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(submission, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
