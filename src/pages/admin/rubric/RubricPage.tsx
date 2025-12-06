// file: src/pages/admin/tests/RubricPage.tsx

import RubricSearchAutocomplete from "./RubricSearchAutocomplete.tsx";

export default function RubricPage() {
  return (
    <div className="rounded-lg border border-subtle bg-surface p-4">
      <h1 className="text-lg font-semibold text-primary mb-2">Rubric</h1>
      <p className="text-sm text-muted">
        This is a placeholder for the admin Rubric Manager view.
      </p>
        <div className="py-5">
            <RubricSearchAutocomplete></RubricSearchAutocomplete>
        </div>
    </div>
  );
}
