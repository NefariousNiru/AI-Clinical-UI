// file: src/pages/admin/rubric/RubricPage.tsx

import {useEffect, useMemo, useState} from "react";
import RubricSearchAutocomplete from "./RubricSearchAutocomplete";
import RubricEditorPanel from "./RubricEditorPanel";
import {useRubricEditor} from "../hooks/rubric";
import Modal from "../../../components/Modal";
import {getAllRubricPatients} from "../../../lib/api/admin/rubric";

type PickerIntent = "create" | "edit";

export default function RubricPage() {
    const editor = useRubricEditor();

    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerIntent, setPickerIntent] = useState<PickerIntent>("edit");
    const [pickerDisease, setPickerDisease] = useState<string | null>(null);

    const [patients, setPatients] = useState<string[]>([]);
    const [patientsLoading, setPatientsLoading] = useState(false);
    const [patientsError, setPatientsError] = useState<string | null>(null);

    const [selectedPatient, setSelectedPatient] = useState<string>("");

    const canPick = useMemo(() => patients.length > 0, [patients.length]);

    function openPicker(intent: PickerIntent, diseaseName: string) {
        setPickerIntent(intent);
        setPickerDisease(diseaseName);
        setPickerOpen(true);
        setPatientsError(null);
    }

    useEffect(() => {
        if (!pickerOpen) return;

        // Fetch once per session (constant list)
        if (patients.length > 0) {
            setSelectedPatient((prev) => prev || patients[0] || "");
            return;
        }

        let cancelled = false;
        setPatientsLoading(true);
        setPatientsError(null);

        getAllRubricPatients()
            .then((list) => {
                if (cancelled) return;
                const cleaned = (list ?? []).map((s) => String(s).trim()).filter(Boolean);
                setPatients(cleaned);
                setSelectedPatient(cleaned[0] ?? "");
            })
            .catch((e) => {
                console.error("[rubric] failed to load patients:", e);
                if (cancelled) return;
                setPatientsError("Failed to load patient list.");
                setPatients([]);
                setSelectedPatient("");
            })
            .finally(() => {
                if (cancelled) return;
                setPatientsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [pickerOpen, patients.length]);

    async function handlePickerContinue() {
        if (!pickerDisease || !selectedPatient) return;

        setPickerOpen(false);

        if (pickerIntent === "create") {
            editor.openCreate(pickerDisease, selectedPatient);
            return;
        }

        // edit intent
        const res = await editor.openEdit(pickerDisease, selectedPatient);
        if (res === "not_found") {
            // Smooth UX: if user picked a patient with no rubric for this disease, open create prefilled.
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
                    <p className="text-muted">
                        Choose which patient this rubric is tied to.
                    </p>

                    {patientsError ? (
                        <p className="text-xs text-danger" role="alert">{patientsError}</p>
                    ) : null}

                    <label className="block space-y-1">
                        <span className="text-xs font-medium text-muted">Patient last name</span>
                        <select
                            value={selectedPatient}
                            onChange={(e) => setSelectedPatient(e.target.value)}
                            disabled={patientsLoading || !canPick}
                            className="mt-1 h-9 w-full rounded-md border border-subtle bg-input px-2 text-sm text-primary"
                        >
                            {patients.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </label>

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
                            disabled={patientsLoading || !pickerDisease || !selectedPatient}
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
