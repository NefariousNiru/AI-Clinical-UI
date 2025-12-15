// file: src/pages/admin/rubric/RubricPage.tsx

import RubricSearchAutocomplete from "./RubricSearchAutocomplete";
import RubricEditorPanel from "./RubricEditorPanel";
import {useRubricEditor} from "../hooks/rubric";

export default function RubricPage() {
    const editor = useRubricEditor();

    return (
        <div>
            <div className="rounded-3xl border border-subtle shadow-sm ring-1 ring-black/5 p-4">
                <h1 className="text-sm font-semibold text-primary mb-2">Rubric Library</h1>
                <p className="text-sm text-muted">Search, add, and modify your rubrics</p>
                <div className="py-2">
                    <RubricSearchAutocomplete
                        onCreateRubric={(id) => editor.openCreate(id)}
                        onViewRubric={(id) => void editor.openEdit(id)}
                    />
                </div>
            </div>
            <div className="p-1"/>
            {editor.mode !== "idle" && editor.rubricId ? (
                <RubricEditorPanel
                    mode={editor.mode === "edit" ? "edit" : "create"}
                    rubricId={editor.rubricId}
                    view={editor.view}
                    setView={editor.setView}
                    raw={editor.raw}
                    setRaw={editor.setRaw}
                    draft={editor.draft}
                    setDraft={editor.setDraft}
                    valid={editor.valid}
                    errors={editor.errors}
                    loading={editor.loading}
                    saving={editor.saving}
                    error={editor.error}
                    onClose={editor.close}
                    onSave={editor.save}
                />
            ) : null}
        </div>
    );
}
