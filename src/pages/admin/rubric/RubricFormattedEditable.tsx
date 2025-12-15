// file: src/pages/admin/rubric/RubricFormattedEditable.tsx

import type {RubricDraft} from "../hooks/rubric.ts";
import {capitalizeFirst} from "../../../lib/functions.ts";

type Props = {
    draft: RubricDraft;
    onChange: (next: RubricDraft) => void;
};

function TextInput({
                       value,
                       onChange,
                       className,
                       disabled = false,
                   }: {
    value: string;
    onChange: (v: string) => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <input
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={[
                "h-8 w-full rounded-md border border-subtle bg-surface px-2 text-xs text-primary",
                className ?? "",
            ].join(" ")}
        />
    );
}

function NumInput({
                      value,
                      onChange,
                      className,
                  }: {
    value: number;
    onChange: (v: number) => void;
    className?: string;
}) {
    return (
        <input
            type="number"
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className={[
                "h-8 w-full rounded-md border border-subtle bg-surface px-2 text-xs text-primary",
                className ?? "",
            ].join(" ")}
        />
    );
}

export default function RubricFormattedEditable({draft, onChange}: Props) {
    const sections = draft.sections;

    return (
        <div className="space-y-3">
            <div className="rounded-2xl border border-subtle p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <label className="space-y-1">
                        <div className="text-[11px] font-medium text-muted">rubricId (Unmodifiable)</div>
                        <TextInput
                            disabled={true}
                            value={draft.rubricId}
                            onChange={(v) => onChange({...draft, rubricId: v})}
                        />
                    </label>

                    <label className="space-y-1">
                        <div className="text-[11px] font-medium text-muted">rubricVersion (Use decimals for minor changes and whole numbers for major changes.)</div>
                        <TextInput
                            value={draft.rubricVersion}
                            onChange={(v) => onChange({...draft, rubricVersion: v})}
                        />
                    </label>

                    <label className="space-y-1">
                        <div className="text-[11px] font-medium text-muted">schemaVersion (Unmodifiable)</div>
                        <TextInput
                            disabled={true}
                            value={draft.schemaVersion}
                            onChange={(v) => onChange({...draft, schemaVersion: v})}
                        />
                    </label>
                </div>
            </div>

            {sections.map((sec, secIdx) => (
                <div key={sec.id} className="rounded-2xl border border-subtle p-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-primary">{capitalizeFirst(sec.id)}</div>
                            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                                <label className="space-y-1">
                                    <div className="text-[11px] font-medium text-muted">title</div>
                                    <TextInput
                                        value={sec.title}
                                        onChange={(v) => {
                                            const next = structuredClone(draft);
                                            next.sections[secIdx].title = v;
                                            onChange(next);
                                        }}
                                    />
                                </label>
                                <label className="space-y-1">
                                    <div className="text-[11px] font-medium text-muted">maxPoints</div>
                                    <NumInput
                                        value={sec.maxPoints}
                                        onChange={(v) => {
                                            const next = structuredClone(draft);
                                            next.sections[secIdx].maxPoints = v;
                                            onChange(next);
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 space-y-3">
                        {sec.blocks.map((b, bIdx) => (
                            <div key={b.id} className="rounded-2xl bg-surface-subtle p-3">
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <label className="space-y-1">
                                        <div className="text-[11px] font-medium text-muted">block title</div>
                                        <TextInput
                                            value={b.title}
                                            onChange={(v) => {
                                                const next = structuredClone(draft);
                                                next.sections[secIdx].blocks[bIdx].title = v;
                                                onChange(next);
                                            }}
                                        />
                                    </label>
                                    <label className="space-y-1">
                                        <div className="text-[11px] font-medium text-muted">block maxPoints</div>
                                        <NumInput
                                            value={b.maxPoints}
                                            onChange={(v) => {
                                                const next = structuredClone(draft);
                                                next.sections[secIdx].blocks[bIdx].maxPoints = v;
                                                onChange(next);
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="mt-2 space-y-2">
                                    {b.criteria.map((c, cIdx) => (
                                        <div
                                            key={`${b.id}-${cIdx}`}
                                            className="rounded-xl border border-subtle bg-surface p-2"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-[11px] font-semibold text-muted">
                                                    {c.type === "binary" ? "binary" : "select_k"}
                                                </div>
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                                                <label className="space-y-1">
                                                    <div className="text-[11px] font-medium text-muted">verbiage</div>
                                                    <TextInput
                                                        value={c.verbiage}
                                                        onChange={(v) => {
                                                            const next = structuredClone(draft);
                                                            next.sections[secIdx].blocks[bIdx].criteria[cIdx].verbiage = v;
                                                            onChange(next);
                                                        }}
                                                    />
                                                </label>

                                                {c.type === "binary" ? (
                                                    <label className="space-y-1">
                                                        <div className="text-[11px] font-medium text-muted">weight</div>
                                                        <NumInput
                                                            value={c.weight}
                                                            onChange={(v) => {
                                                                const next = structuredClone(draft);
                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                if (crit.type === "binary") crit.weight = v;
                                                                onChange(next);
                                                            }}
                                                        />
                                                    </label>
                                                ) : (
                                                    <label className="space-y-1">
                                                        <div
                                                            className="text-[11px] font-medium text-muted">awardPoints
                                                        </div>
                                                        <NumInput
                                                            value={c.awardPoints}
                                                            onChange={(v) => {
                                                                const next = structuredClone(draft);
                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                if (crit.type === "select_k") crit.awardPoints = v;
                                                                onChange(next);
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>

                                            {c.type === "select_k" && Array.isArray(c.items) ? (
                                                <div className="mt-2 space-y-2">
                                                    <div className="text-[11px] font-medium text-muted">items</div>
                                                    {c.items.map((it, itIdx) => (
                                                        <div key={`${it.key}-${itIdx}`}
                                                             className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                            <TextInput
                                                                value={it.key}
                                                                onChange={(v) => {
                                                                    const next = structuredClone(draft);
                                                                    const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                    if (crit.type === "select_k") crit.items[itIdx].key = v;
                                                                    onChange(next);
                                                                }}
                                                            />
                                                            <TextInput
                                                                value={it.verbiage}
                                                                onChange={(v) => {
                                                                    const next = structuredClone(draft);
                                                                    const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                    if (crit.type === "select_k") crit.items[itIdx].verbiage = v;
                                                                    onChange(next);
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
