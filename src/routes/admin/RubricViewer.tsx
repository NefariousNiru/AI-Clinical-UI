// src/routes/admin/RubricViewer.tsx
import { useState } from "react";
import JsonBlock from "./JsonBlock";
import type { RubricPayload } from "../../types/rubric";
import RubricFormatted from "./RubricFormatted";
import { titleize } from "../../lib/functions";
import Modal from "../../components/ui/Modal";
import Tabs from "../../components/ui/Tabs";

/*
1) Purpose: Display a rubric by id with formatted and JSON views.
2) Data: Controlled open flag, optional rubric payload, rubric id string, and loading flag.
3) UI: Shared <Modal> and <Tabs> keep visuals consistent and reduce duplication.
4) Flow: Shows a loading stub -> formatted/JSON -> "no rubric" fallback.
*/

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
      title={rubricId ? `Rubric: ${titleize(rubricId)}` : "Rubric"}
      headerRight={headerRight}
    >
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
    </Modal>
  );
}
