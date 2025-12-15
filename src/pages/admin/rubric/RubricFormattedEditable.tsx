// file: src/pages/admin/rubric/RubricFormatedEditable.tsx

import type {RubricDraft} from "../hooks/rubric";
import {
    isValidSnakeKey,
    newId,
    recomputeDerivedPoints,
} from "../../../lib/utils/rubricEdit";
import {capitalizeFirst} from "../../../lib/utils/functions.ts";

type Props = {
    draft: RubricDraft;
    onChange: (next: RubricDraft) => void;
};

function TextInput({
                       value,
                       onChange,
                       className,
                       disabled = false,
                       placeholder,
                   }: {
    value: string;
    onChange: (v: string) => void;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <input
            disabled={disabled}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={[
                "h-8 w-full rounded-md border border-subtle bg-surface px-2 text-xs text-primary placeholder:text-muted",
                disabled ? "opacity-70" : "",
                className ?? "",
            ].join(" ")}
        />
    );
}

function NumInput({
                      value,
                      onChange,
                      className,
                      disabled = false,
                  }: {
    value: number;
    onChange: (v: number) => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <input
            disabled={disabled}
            type="number"
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className={[
                "h-8 w-full rounded-md border border-subtle bg-surface px-2 text-xs text-primary",
                disabled ? "opacity-70" : "",
                className ?? "",
            ].join(" ")}
        />
    );
}

function SectionHeader({
                           title,
                           right,
                       }: {
    title: string;
    right?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-primary">{title}</div>
            </div>
            {right ? <div className="shrink-0">{right}</div> : null}
        </div>
    );
}

export default function RubricFormattedEditable({draft, onChange}: Props) {
    function commit(next: RubricDraft) {
        onChange(recomputeDerivedPoints(next));
    }

    function addEvidenceKey() {
        const k = "new_evidence_key";
        commit({...draft, evidenceKeys: [...draft.evidenceKeys, k]});
    }

    function removeEvidenceKey(idx: number) {
        const next = structuredClone(draft);
        next.evidenceKeys.splice(idx, 1);
        commit(next);
    }

    function addBlock(secIdx: number) {
        const next = structuredClone(draft);
        next.sections[secIdx].blocks.push({
            id: newId("block"),
            title: "New block",
            maxPoints: 0,
            criteria: [],
            notes: "",
        });
        commit(next);
    }

    function removeBlock(secIdx: number, bIdx: number) {
        const sec = draft.sections[secIdx];
        const block = sec.blocks[bIdx];

        // guard: never remove required priority block
        if (sec.id === "identification" && block.id === "priority") return;

        const next = structuredClone(draft);
        next.sections[secIdx].blocks.splice(bIdx, 1);
        commit(next);
    }

    function addBinaryCriterion(secIdx: number, bIdx: number) {
        const next = structuredClone(draft);
        next.sections[secIdx].blocks[bIdx].criteria.push({
            type: "binary",
            key: "new_binary_key",
            verbiage: "New binary criterion",
            weight: 0,
        });
        commit(next);
    }

    function addSelectKCriterion(secIdx: number, bIdx: number) {
        const next = structuredClone(draft);
        next.sections[secIdx].blocks[bIdx].criteria.push({
            type: "select_k",
            groupId: "new_group_id",
            verbiage: "New select_k criterion",
            selectK: 1,
            awardPoints: 0,
            items: [{key: "new_item_key", verbiage: "New item"}],
        });
        commit(next);
    }

    function removeCriterion(secIdx: number, bIdx: number, cIdx: number) {
        const next = structuredClone(draft);
        next.sections[secIdx].blocks[bIdx].criteria.splice(cIdx, 1);
        commit(next);
    }

    function addSelectKItem(secIdx: number, bIdx: number, cIdx: number) {
        const next = structuredClone(draft);
        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
        if (crit.type !== "select_k") return;
        crit.items.push({key: "new_item_key", verbiage: "New item"});
        commit(next);
    }

    function removeSelectKItem(secIdx: number, bIdx: number, cIdx: number, itIdx: number) {
        const next = structuredClone(draft);
        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
        if (crit.type !== "select_k") return;
        if (crit.items.length <= 1) return; // keep at least 1
        crit.items.splice(itIdx, 1);
        commit(next);
    }

    return (
        <div className="space-y-3">
            {/* rubric header */}
            <div className="rounded-2xl border border-subtle p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <label className="space-y-1">
                        <div className="text-[11px] font-medium text-muted">rubricId (Unmodifiable)</div>
                        <TextInput disabled value={draft.rubricId} onChange={() => {
                        }}/>
                    </label>

                    <label className="space-y-1">
                        <div className="text-[11px] font-medium text-muted">
                            rubricVersion (Use decimals for minor changes and whole numbers for major changes.)
                        </div>
                        <TextInput
                            value={draft.rubricVersion}
                            onChange={(v) => commit({...draft, rubricVersion: v})}
                        />
                    </label>

                    <label className="space-y-1">
                        <div className="text-[11px] font-medium text-muted">schemaVersion (Unmodifiable)</div>
                        <TextInput disabled value={draft.schemaVersion} onChange={() => {
                        }}/>
                    </label>
                </div>

                {/* evidence keys */}
                <div className="mt-3 rounded-xl border border-subtle bg-surface-subtle p-3">
                    <SectionHeader
                        title="Evidence keys"
                        right={
                            <button
                                type="button"
                                onClick={addEvidenceKey}
                                className="h-7 rounded-4xl bg-secondary px-2 text-[11px] font-medium text-on-secondary hover:opacity-90"
                            >
                                Add evidence key
                            </button>
                        }
                    />
                    <div className="mt-2 space-y-2">
                        {draft.evidenceKeys.length === 0 ? (
                            <div className="text-[11px] text-muted">No evidence keys yet.</div>
                        ) : (
                            draft.evidenceKeys.map((k, idx) => {
                                const ok = isValidSnakeKey(k);
                                return (
                                    <div key={`${k}-${idx}`} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <TextInput
                                                value={k}
                                                placeholder="snake_case like onset_hours_less_than_36"
                                                onChange={(v) => {
                                                    const next = structuredClone(draft);
                                                    next.evidenceKeys[idx] = v;
                                                    commit(next);
                                                }}
                                                className={ok ? "" : "border-danger"}
                                            />
                                            {!ok ? (
                                                <div className="mt-1 text-[11px] text-danger">
                                                    Use snake_case like onset_hours_less_than_36
                                                </div>
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeEvidenceKey(idx)}
                                            className="h-8 rounded-4xl border border-subtle bg-surface px-2 text-[11px] font-medium text-primary hover:bg-surface-subtle"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* sections */}
            {draft.sections.map((sec, secIdx) => (
                <div key={sec.id} className="rounded-2xl border border-subtle p-3">
                    <SectionHeader
                        title={`${capitalizeFirst(sec.id)} (derived maxPoints: ${sec.maxPoints})`}
                        right={
                            <button
                                type="button"
                                onClick={() => addBlock(secIdx)}
                                className="h-7 rounded-4xl bg-secondary px-2 text-[11px] font-medium text-on-secondary hover:opacity-90"
                            >
                                Add block
                            </button>
                        }
                    />

                    <div className="mt-3 space-y-3">
                        {sec.blocks.map((b, bIdx) => (
                            <div key={b.id} className="rounded-2xl bg-surface-subtle p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                            <label className="space-y-1 md:col-span-2">
                                                <div className="text-[11px] font-medium text-muted">block title</div>
                                                <TextInput
                                                    value={b.title}
                                                    onChange={(v) => {
                                                        const next = structuredClone(draft);
                                                        next.sections[secIdx].blocks[bIdx].title = v;
                                                        commit(next);
                                                    }}
                                                />
                                            </label>

                                            <label className="space-y-1">
                                                <div className="text-[11px] font-medium text-muted">block maxPoints
                                                    (derived)
                                                </div>
                                                <NumInput value={b.maxPoints} onChange={() => {
                                                }} disabled/>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => removeBlock(secIdx, bIdx)}
                                            disabled={sec.id === "identification" && b.id === "priority"}
                                            className="h-7 rounded-4xl border border-subtle bg-surface px-2 text-[11px] font-medium text-primary hover:bg-surface-subtle disabled:opacity-60"
                                            title={sec.id === "identification" && b.id === "priority" ? "Priority block is required" : "Remove block"}
                                        >
                                            Remove block
                                        </button>
                                    </div>
                                </div>

                                {/* criteria controls */}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => addBinaryCriterion(secIdx, bIdx)}
                                        className="h-7 rounded-4xl border border-subtle bg-surface px-2 text-[11px] font-medium text-primary hover:bg-surface-subtle"
                                    >
                                        Add binary criterion
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addSelectKCriterion(secIdx, bIdx)}
                                        className="h-7 rounded-4xl border border-subtle bg-surface px-2 text-[11px] font-medium text-primary hover:bg-surface-subtle"
                                    >
                                        Add select_k criterion
                                    </button>
                                    <div className="text-[11px] text-muted">
                                        Keys should be snake_case like onset_hours_less_than_36
                                    </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                    {b.criteria.length === 0 ? (
                                        <div className="text-[11px] text-muted">No criteria yet. Add one above.</div>
                                    ) : (
                                        b.criteria.map((c, cIdx) => (
                                            <div key={`${b.id}-${cIdx}`}
                                                 className="rounded-xl border border-subtle bg-surface p-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-[11px] font-semibold text-muted">
                                                        {c.type === "binary" ? "binary" : "select_k"}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeCriterion(secIdx, bIdx, cIdx)}
                                                        className="h-7 rounded-4xl border border-subtle bg-surface-subtle px-2 text-[11px] font-medium text-primary hover:bg-surface"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                                                    <label className="space-y-1">
                                                        <div className="text-[11px] font-medium text-muted">verbiage
                                                        </div>
                                                        <TextInput
                                                            value={c.verbiage}
                                                            onChange={(v) => {
                                                                const next = structuredClone(draft);
                                                                next.sections[secIdx].blocks[bIdx].criteria[cIdx].verbiage = v;
                                                                commit(next);
                                                            }}
                                                        />
                                                    </label>

                                                    {c.type === "binary" ? (
                                                        <>
                                                            <label className="space-y-1">
                                                                <div
                                                                    className="text-[11px] font-medium text-muted">key
                                                                </div>
                                                                <TextInput
                                                                    value={c.key}
                                                                    className={isValidSnakeKey(c.key) ? "" : "border-danger"}
                                                                    onChange={(v) => {
                                                                        const next = structuredClone(draft);
                                                                        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                        if (crit.type === "binary") crit.key = v;
                                                                        commit(next);
                                                                    }}
                                                                />
                                                            </label>

                                                            <label className="space-y-1">
                                                                <div
                                                                    className="text-[11px] font-medium text-muted">weight
                                                                    (points)
                                                                </div>
                                                                <NumInput
                                                                    value={c.weight}
                                                                    onChange={(v) => {
                                                                        const next = structuredClone(draft);
                                                                        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                        if (crit.type === "binary") crit.weight = v;
                                                                        commit(next);
                                                                    }}
                                                                />
                                                            </label>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <label className="space-y-1">
                                                                <div
                                                                    className="text-[11px] font-medium text-muted">groupId
                                                                </div>
                                                                <TextInput
                                                                    value={c.groupId}
                                                                    className={isValidSnakeKey(c.groupId) ? "" : "border-danger"}
                                                                    onChange={(v) => {
                                                                        const next = structuredClone(draft);
                                                                        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                        if (crit.type === "select_k") crit.groupId = v;
                                                                        commit(next);
                                                                    }}
                                                                />
                                                            </label>

                                                            <label className="space-y-1">
                                                                <div
                                                                    className="text-[11px] font-medium text-muted">selectK
                                                                </div>
                                                                <NumInput
                                                                    value={c.selectK}
                                                                    onChange={(v) => {
                                                                        const next = structuredClone(draft);
                                                                        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                        if (crit.type === "select_k") crit.selectK = Math.max(1, Math.floor(v));
                                                                        commit(next);
                                                                    }}
                                                                />
                                                            </label>

                                                            <label className="space-y-1">
                                                                <div
                                                                    className="text-[11px] font-medium text-muted">awardPoints
                                                                    (points)
                                                                </div>
                                                                <NumInput
                                                                    value={c.awardPoints}
                                                                    onChange={(v) => {
                                                                        const next = structuredClone(draft);
                                                                        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                        if (crit.type === "select_k") crit.awardPoints = v;
                                                                        commit(next);
                                                                    }}
                                                                />
                                                            </label>
                                                        </>
                                                    )}
                                                </div>

                                                {c.type === "select_k" ? (
                                                    <div
                                                        className="mt-3 rounded-xl border border-subtle bg-surface-subtle p-3">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div
                                                                className="text-[11px] font-semibold text-muted">items
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => addSelectKItem(secIdx, bIdx, cIdx)}
                                                                className="h-7 rounded-4xl bg-secondary px-2 text-[11px] font-medium text-on-secondary hover:opacity-90"
                                                            >
                                                                Add item
                                                            </button>
                                                        </div>

                                                        <div className="mt-2 space-y-2">
                                                            {c.items.map((it, itIdx) => (
                                                                <div key={`${it.key}-${itIdx}`}
                                                                     className="rounded-xl border border-subtle bg-surface p-2">
                                                                    <div
                                                                        className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                                                        <label className="space-y-1">
                                                                            <div
                                                                                className="text-[11px] font-medium text-muted">key
                                                                            </div>
                                                                            <TextInput
                                                                                value={it.key}
                                                                                className={isValidSnakeKey(it.key) ? "" : "border-danger"}
                                                                                onChange={(v) => {
                                                                                    const next = structuredClone(draft);
                                                                                    const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                    if (crit.type === "select_k") crit.items[itIdx].key = v;
                                                                                    commit(next);
                                                                                }}
                                                                            />
                                                                        </label>

                                                                        <label className="space-y-1 md:col-span-2">
                                                                            <div
                                                                                className="text-[11px] font-medium text-muted">verbiage
                                                                            </div>
                                                                            <TextInput
                                                                                value={it.verbiage}
                                                                                onChange={(v) => {
                                                                                    const next = structuredClone(draft);
                                                                                    const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                    if (crit.type === "select_k") crit.items[itIdx].verbiage = v;
                                                                                    commit(next);
                                                                                }}
                                                                            />
                                                                        </label>
                                                                    </div>

                                                                    <div className="mt-2 flex justify-end">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeSelectKItem(secIdx, bIdx, cIdx, itIdx)}
                                                                            disabled={c.items.length <= 1}
                                                                            className="h-7 rounded-4xl border border-subtle bg-surface-subtle px-2 text-[11px] font-medium text-primary hover:bg-surface disabled:opacity-60"
                                                                            title={c.items.length <= 1 ? "At least one item is required" : "Remove item"}
                                                                        >
                                                                            Remove item
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
