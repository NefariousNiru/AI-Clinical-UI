// file: src/pages/admin/rubric/components/NonScoredClinicalNotesPanel.tsx

import {FieldLabel, SmallButton, TextArea, TooltipBadge} from "./RubricFormAtoms";

export function NonScoredClinicalNotesPanel({
                                                nonScoredTip,
                                                notes,
                                                rowIds,
                                                addNote,
                                                removeNote,
                                                onChangeNote,
                                            }: {
    nonScoredTip: string;
    notes: string[];
    rowIds: string[];
    addNote: () => void;
    removeNote: (idx: number) => void;
    onChangeNote: (idx: number, nextValue: string) => void;
}) {
    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold text-primary">
                        Notes <span className="ml-1 inline-flex"><TooltipBadge tip={nonScoredTip}/></span>
                    </div>
                </div>
                <div className="w-[140px]">
                    <SmallButton onClick={addNote} variant="secondary" title="Add a new note" fullWidth>
                        Add note
                    </SmallButton>
                </div>
            </div>

            {notes.length === 0 ? (
                <div className="mt-2 rounded-xl border border-subtle bg-surface px-3 py-2 text-[11px] text-muted">
                    No notes yet.
                </div>
            ) : (
                <div className="mt-2 space-y-2">
                    {notes.map((n, idx) => (
                        <div
                            key={rowIds[idx]}
                            className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px] md:items-end"
                        >
                            <div className="space-y-1">
                                <FieldLabel label={`Note ${idx + 1}`}/>
                                <TextArea
                                    value={n}
                                    onChange={(v) => onChangeNote(idx, v)}
                                    placeholder="Feedback-only clinical note"
                                />
                            </div>

                            <SmallButton
                                onClick={() => removeNote(idx)}
                                variant="ghost"
                                title="Remove this note"
                                fullWidth
                            >
                                Remove
                            </SmallButton>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
