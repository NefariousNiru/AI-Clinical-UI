// file: src/pages/admin/rubric/EvidenceKeysPanel.tsx

import {FieldLabel, SmallButton, TextInput, TooltipBadge} from "./RubricFormAtoms";
import {isValidSnakeKey} from "../../../lib/utils/rubricEdit.ts";

export function EvidenceKeysPanel({
                                      evidenceTip,
                                      evidenceKeys,
                                      evidenceRowIds,
                                      addEvidenceKey,
                                      removeEvidenceKey,
                                      showInvalid,
                                      markTouched,
                                      onChangeKey,
                                  }: {
    evidenceTip: string;
    evidenceKeys: string[];
    evidenceRowIds: string[];
    addEvidenceKey: () => void;
    removeEvidenceKey: (idx: number) => void;
    showInvalid: (path: string, ok: boolean) => boolean;
    markTouched: (path: string) => void;
    onChangeKey: (idx: number, nextValue: string) => void;
}) {
    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="text-xs font-semibold text-primary">
                        Keys <span className="ml-1 inline-flex"><TooltipBadge tip={evidenceTip}/></span>
                    </div>
                </div>
                <div className="w-[140px]">
                    <SmallButton onClick={addEvidenceKey} variant="secondary" title="Add a new evidence key" fullWidth>
                        Add key
                    </SmallButton>
                </div>
            </div>

            {evidenceKeys.length === 0 ? (
                <div className="mt-2 rounded-xl border border-subtle bg-surface px-3 py-2 text-[11px] text-muted">
                    No evidence keys yet.
                </div>
            ) : (
                <div className="mt-2 space-y-2">
                    {evidenceKeys.map((k, idx) => {
                        const ok = isValidSnakeKey(k);
                        const path = `evidenceKeys.${idx}`;

                        return (
                            <div
                                key={evidenceRowIds[idx]}
                                className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px] md:items-end"
                            >
                                <div className="space-y-1">
                                    <FieldLabel label={`Key ${idx + 1}`}/>
                                    <TextInput
                                        value={k}
                                        placeholder="onset_lt_36hr"
                                        invalid={showInvalid(path, ok)}
                                        onBlur={() => markTouched(path)}
                                        onChange={(v) => onChangeKey(idx, v)}
                                    />
                                </div>

                                <SmallButton
                                    onClick={() => removeEvidenceKey(idx)}
                                    variant="ghost"
                                    title="Remove this key"
                                    fullWidth
                                >
                                    Remove
                                </SmallButton>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-3 flex justify-end">
                <div className="w-[140px]">
                    <SmallButton onClick={addEvidenceKey} variant="secondary" title="Add a new evidence key" fullWidth>
                        Add key
                    </SmallButton>
                </div>
            </div>
        </>
    );
}
