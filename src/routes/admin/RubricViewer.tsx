// src/routes/admin/RubricViewer.tsx
import { useState } from "react";
import JsonBlock from "./JsonBlock";
import type { RubricPayload } from "../../types/rubric";
import RubricFormatted from "./RubricFormatted";
import { titleize } from "../../lib/functions";

export default function RubricViewer({
  open,
  onClose,
  rubric,
  rubricId,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  rubric: RubricPayload | null;
  rubricId?: string | null;
  loading?: boolean;
}) {
  const [view, setView] = useState<"formatted" | "json">("formatted");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="absolute inset-x-0 top-16 mx-auto w-[min(1000px,95vw)] rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-semibold">
            {rubricId ? `Rubric: ${titleize(rubricId)}` : "Rubric"}
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

        <div className="px-5 py-4">
          {loading ? (
            <div className="text-sm text-gray-600 py-8">Loading rubric…</div>
          ) : rubric ? (
            view === "json" ? (
              <JsonBlock
                data={rubric}
                filename={`rubric-${rubricId ?? "unknown"}.json`}
              />
            ) : (
              <RubricFormatted rubric={rubric} />
            )
          ) : (
            <div className="text-sm text-gray-600 py-8">No rubric loaded.</div>
          )}
        </div>
      </div>
    </div>
  );
}
