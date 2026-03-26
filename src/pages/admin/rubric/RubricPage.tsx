// file: src/pages/admin/rubric/RubricPage.tsx

import {useState} from "react";
import RubricSearchAutocomplete from "./RubricSearchAutocomplete";
import RubricEditorPanel from "./RubricEditorPanel";
import {useRubricEditor} from "../hooks/rubric";
import Modal from "../../../components/Modal";
import PatientLastNamePicker from "./PatientLastNamePicker";

type PickerIntent = "create" | "edit";

export default function RubricPage() {
    const editor = useRubricEditor();

    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerIntent, setPickerIntent] = useState<PickerIntent>("edit");
    const [pickerDisease, setPickerDisease] = useState<string | null>(null);

    const [selectedPatient, setSelectedPatient] = useState<string>("");

    function openPicker(intent: PickerIntent, diseaseName: string) {
        setPickerIntent(intent);
        setPickerDisease(diseaseName);
        setPickerOpen(true);
        // optional: reset so it re-autoselects first option
        setSelectedPatient("");
    }

    async function handlePickerContinue() {
        if (!pickerDisease || !selectedPatient) return;

        setPickerOpen(false);

        if (pickerIntent === "create") {
            editor.openCreate(pickerDisease, selectedPatient);
            return;
        }

        const res = await editor.openEdit(pickerDisease, selectedPatient);
        if (res === "not_found") {
            editor.openCreate(pickerDisease, selectedPatient);
        }
    }

    return (
        <div>
            <div className="rounded-3xl border border-subtle shadow-sm p-4">
                <h1 className="text-sm font-semibold text-primary mb-2">Rubric Library</h1>
                <p className="text-sm text-muted">Search, add, and modify your rubrics</p>
                <div className="py-2">
                    <RubricSearchAutocomplete
                        onCreateRubric={(diseaseName) => openPicker("create", diseaseName)}
                        onViewRubric={(diseaseName) => openPicker("edit", diseaseName)}
                    />
                </div>
            </div>

            <div className="p-1"/>

            {editor.mode !== "idle" && editor.rubricId ? (
                <RubricEditorPanel
                    mode={editor.mode === "edit" ? "edit" : "create"}
                    rubricId={editor.rubricId}
                    patientLastName={editor.patientLastName}
                    view={editor.view}
                    setView={editor.setView}
                    raw={editor.raw}
                    setRaw={editor.setRaw}
                    fileDraft={editor.fileDraft}
                    setFileDraft={editor.setFileDraft}
                    instructorName={editor.instructorName}
                    setInstructorName={editor.setInstructorName}
                    status={editor.status}
                    setStatus={editor.setStatus}
                    notes={editor.notes}
                    setNotes={editor.setNotes}
                    valid={editor.valid}
                    errors={editor.errors}
                    validationVisible={editor.validationVisible}
                    setValidationVisible={editor.setValidationVisible}
                    loading={editor.loading}
                    saving={editor.saving}
                    error={editor.error}
                    onClose={editor.close}
                    onSave={editor.save}
                />
            ) : null}

            <Modal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                title="Select patient"
                className="w-[min(460px,95vw)]"
            >
                <div className="space-y-3 text-sm">
                    <p className="text-muted">Choose which patient this rubric is tied to.</p>

                    <PatientLastNamePicker
                        label="Patient last name"
                        value={selectedPatient}
                        onChange={setSelectedPatient}
                        required
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setPickerOpen(false)}
                            className="h-8 rounded-4xl border border-subtle bg-surface-subtle px-3 text-xs font-medium text-primary hover:bg-surface"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() => void handlePickerContinue()}
                            disabled={!pickerDisease || !selectedPatient}
                            className="inline-flex h-8 items-center rounded-4xl bg-secondary px-3 text-xs font-medium text-on-secondary hover:opacity-90 disabled:opacity-60"
                        >
                            {pickerIntent === "create" ? "Create rubric" : "Open rubric"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
