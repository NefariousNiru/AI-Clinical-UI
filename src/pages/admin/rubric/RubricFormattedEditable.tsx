// file: src/pages/admin/rubric/RubricFormattedEditable.tsx

import React, {useEffect, useMemo, useRef, useState} from "react";
import type {RubricJson} from "../../../lib/types/rubricSchema";
import {isValidSnakeKey, newId, recomputeDerivedPoints} from "../../../lib/utils/rubricEdit";
import {capitalizeFirst} from "../../../lib/utils/functions";
import {ChevronDown, ChevronUp} from "lucide-react";

type Props = {
    draft: RubricJson;
    onChange: (next: RubricJson) => void;
};

function TooltipBadge({tip}: { tip: string }) {
    return (
        <span className="relative inline-flex items-center">
      <span
          className={[
              "group inline-flex h-4 w-4 items-center justify-center rounded-full",
              "border border-subtle bg-surface-subtle text-[10px] font-semibold text-muted",
              "cursor-default select-none",
          ].join(" ")}
          aria-label={tip}
      >
        ?
        <span
            className={[
                "pointer-events-none absolute top-full z-50 mt-2 hidden",
                "left-2 right-2 mx-auto",
                "w-[260px] max-w-[calc(100vw-16px)]",
                "whitespace-normal break-words rounded-xl",
                "border border-subtle bg-surface px-2 py-1.5 text-[11px] leading-snug text-primary shadow-lg",
                "group-hover:block",
            ].join(" ")}
            role="tooltip"
        >
          {tip}
        </span>
      </span>
    </span>
    );
}

function FieldLabel({label, tip}: { label: string; tip?: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="text-[11px] font-medium text-muted">{label}</div>
            {tip ? <TooltipBadge tip={tip}/> : null}
        </div>
    );
}

function Card({
                  title,
                  open,
                  onToggle,
                  children,
                  right,
              }: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-subtle app-bg shadow-sm">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={open}
            >
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary">
                        {capitalizeFirst(title)}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {right ? <div className="hidden sm:block">{right}</div> : null}
                    {open ? <ChevronUp/> : <ChevronDown/>}
                </div>
            </button>

            {open ? <div className="px-4 pb-4">{children}</div> : null}
        </section>
    );
}

function TextInput({
                       value,
                       onChange,
                       onBlur,
                       disabled = false,
                       placeholder,
                       invalid = false,
                       title,
                   }: {
    value: string;
    onChange: (v: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    invalid?: boolean;
    title?: string;
}) {
    return (
        <input
            disabled={disabled}
            value={value}
            placeholder={placeholder}
            title={title}
            onBlur={onBlur}
            onChange={(e) => onChange(e.target.value)}
            className={[
                "h-8 w-full rounded-3xl border bg-surface px-2 text-xs text-primary placeholder:text-muted",
                invalid ? "border-danger" : "border-subtle",
                disabled ? "opacity-50" : "",
                "focus:outline-none focus:border-strong",
            ].join(" ")}
        />
    );
}

function NumInput({
                      value,
                      onChange,
                      onBlur,
                      disabled = false,
                      title,
                  }: {
    value: number;
    onChange: (v: number) => void;
    onBlur?: () => void;
    disabled?: boolean;
    title?: string;
}) {
    return (
        <input
            disabled={disabled}
            type="number"
            value={Number.isFinite(value) ? value : 0}
            title={title}
            onBlur={onBlur}
            onChange={(e) => onChange(Number(e.target.value))}
            className={[
                "h-8 w-full rounded-3xl border border-subtle bg-surface px-2 text-xs text-primary",
                disabled ? "opacity-70" : "",
                "focus:outline-none focus:border-strong",
            ].join(" ")}
        />
    );
}

function SmallButton({
                         children,
                         onClick,
                         variant = "secondary",
                         disabled = false,
                         title,
                         fullWidth = false,
                     }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: "secondary" | "ghost" | "danger";
    disabled?: boolean;
    title?: string;
    fullWidth?: boolean;
}) {
    const cls =
        variant === "secondary"
            ? "bg-secondary text-on-secondary hover:opacity-90"
            : variant === "danger"
                ? "bg-danger text-on-danger hover:opacity-90"
                : "border border-subtle bg-surface text-primary hover:bg-surface-subtle";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={[
                "h-8 rounded-3xl px-3 text-[11px] font-medium",
                fullWidth ? "w-full" : "",
                cls,
                disabled ? "opacity-60" : "",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function makeUniqueEvidenceKey(existing: string[]) {
    const base = "evidence_key";
    const used = new Set(existing.map((s) => s.trim()).filter(Boolean));
    if (!used.has(base)) return base;

    for (let i = 2; i < 10_000; i++) {
        const k = `${base}_${i}`;
        if (!used.has(k)) return k;
    }
    return `${base}_${Date.now()}`;
}

export default function RubricFormattedEditable({draft, onChange}: Props) {
    const [open, setOpen] = useState({
        details: true,
        evidence: false,
        identification: false,
        explanation: false,
        plan_recommendation: false,
        monitoring: false,
    });

    const [local, setLocal] = useState<RubricJson>(draft);

    const rubricKey = `${draft.rubricId}::${draft.schemaVersion}::${draft.rubricVersion}`;
    const lastRubricKeyRef = useRef<string>(rubricKey);

    useEffect(() => {
        if (lastRubricKeyRef.current !== rubricKey) {
            lastRubricKeyRef.current = rubricKey;
            setLocal(draft);
            setTouched({});
            evidenceRowIdsRef.current = [];
        }
    }, [rubricKey, draft]);

    const [touched, setTouched] = useState<Record<string, true>>({});

    function markTouched(path: string) {
        setTouched((m) => (m[path] ? m : {...m, [path]: true}));
    }

    function showInvalid(path: string, ok: boolean) {
        return touched[path] ? !ok : false;
    }

    function commit(next: RubricJson) {
        let canonical = next;
        try {
            canonical = recomputeDerivedPoints(next);
        } catch {
            canonical = next;
        }
        setLocal(canonical);
        onChange(canonical);
    }

    const sectionIndexById = useMemo(() => {
        const m = new Map<string, number>();
        local.sections.forEach((s, i) => m.set(s.id, i));
        return m;
    }, [local.sections]);

    const evidenceRowIdsRef = useRef<string[]>([]);

    function ensureEvidenceRowIds(len: number) {
        const ids = evidenceRowIdsRef.current;
        while (ids.length < len) ids.push(newId("evk"));
        if (ids.length > len) ids.splice(len);
    }

    ensureEvidenceRowIds(local.evidenceKeys.length);

    function addEvidenceKey() {
        const next = structuredClone(local);
        next.evidenceKeys.push(makeUniqueEvidenceKey(next.evidenceKeys));
        commit(next);
    }

    function removeEvidenceKey(idx: number) {
        const next = structuredClone(local);
        next.evidenceKeys.splice(idx, 1);
        commit(next);
    }

    function addBlock(secIdx: number) {
        const next = structuredClone(local);
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
        const sec = local.sections[secIdx];
        const block = sec.blocks[bIdx];
        if (sec.id === "identification" && block.id === "priority") return;

        const next = structuredClone(local);
        next.sections[secIdx].blocks.splice(bIdx, 1);
        commit(next);
    }

    function addBinaryCriterion(secIdx: number, bIdx: number) {
        const next = structuredClone(local);
        next.sections[secIdx].blocks[bIdx].criteria.push({
            type: "binary",
            key: "new_key",
            verbiage: "New item",
            weight: 0,
            unitEquivalents: null,
            notes: null,
            aliases: null,
        });
        commit(next);
    }

    function addSelectKCriterion(secIdx: number, bIdx: number) {
        const next = structuredClone(local);
        next.sections[secIdx].blocks[bIdx].criteria.push({
            type: "select_k",
            groupId: "new_group",
            verbiage: "New item",
            selectK: 1,
            awardPoints: 0,
            items: [{key: "new_item", verbiage: "New choice", notes: null, aliases: null}],
            dependsOnAny: null,
            minItemsRequired: null,
            unitEquivalents: null,
            notes: null,
        });
        commit(next);
    }

    function removeCriterion(secIdx: number, bIdx: number, cIdx: number) {
        const next = structuredClone(local);
        next.sections[secIdx].blocks[bIdx].criteria.splice(cIdx, 1);
        commit(next);
    }

    function addSelectKItem(secIdx: number, bIdx: number, cIdx: number) {
        const next = structuredClone(local);
        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
        if (crit.type !== "select_k") return;
        crit.items.push({key: "new_item", verbiage: "New choice", notes: null, aliases: null});
        commit(next);
    }

    function removeSelectKItem(secIdx: number, bIdx: number, cIdx: number, itIdx: number) {
        const next = structuredClone(local);
        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
        if (crit.type !== "select_k") return;
        if (crit.items.length <= 1) return;
        crit.items.splice(itIdx, 1);
        commit(next);
    }

    function renderSection(secId: string) {
        const secIdx = sectionIndexById.get(secId);
        if (secIdx === undefined) return null;

        const sec = local.sections[secIdx];

        const keyTip = 'Use short and concise keys like "onset_lt_36hr".';
        const pickKTip =
            "If there are multiple correct options, picking at least K correct choices earns the points.";

        return (
            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <label className="space-y-1 md:col-span-2">
                        <FieldLabel label="Title" tip="Section title shown to instructors and students."/>
                        <TextInput
                            value={sec.title}
                            onChange={(v) => {
                                const next = structuredClone(local);
                                next.sections[secIdx].title = v;
                                commit(next);
                            }}
                        />
                    </label>

                    <label className="space-y-1">
                        <FieldLabel label="Total points" tip="This updates automatically based on what you add below."/>
                        <NumInput value={sec.maxPoints} onChange={() => {
                        }} disabled/>
                    </label>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-primary">Blocks</div>
                    <SmallButton onClick={() => addBlock(secIdx)} variant="secondary" title="Add a new block">
                        Add block
                    </SmallButton>
                </div>

                {sec.blocks.length === 0 ? (
                    <div className="rounded-xl border border-subtle bg-surface px-3 py-2 text-[11px] text-muted">
                        No blocks yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sec.blocks.map((b, bIdx) => {
                            const canRemove = !(sec.id === "identification" && b.id === "priority");

                            return (
                                <div key={b.id} className="rounded-xl border border-subtle app-bg shadow-sm">
                                    <div
                                        className="flex flex-wrap items-end justify-between gap-2 border-b border-subtle px-3 py-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                                <label className="space-y-1 md:col-span-2">
                                                    <FieldLabel label="Block title"
                                                                tip="Group related items together."/>
                                                    <TextInput
                                                        value={b.title}
                                                        onChange={(v) => {
                                                            const next = structuredClone(local);
                                                            next.sections[secIdx].blocks[bIdx].title = v;
                                                            commit(next);
                                                        }}
                                                    />
                                                </label>

                                                <label className="space-y-1">
                                                    <FieldLabel label="Total points"
                                                                tip="This updates automatically based on items below."/>
                                                    <NumInput value={b.maxPoints} onChange={() => {
                                                    }} disabled/>
                                                </label>
                                            </div>
                                        </div>

                                        <SmallButton
                                            onClick={() => removeBlock(secIdx, bIdx)}
                                            variant="ghost"
                                            disabled={!canRemove}
                                            title={!canRemove ? "This block is required." : "Remove this block"}
                                        >
                                            Remove block
                                        </SmallButton>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                                        <div className="text-[11px] text-muted">Add items to define what earns points.
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <SmallButton onClick={() => addBinaryCriterion(secIdx, bIdx)}
                                                         variant="ghost" title="Binary item">
                                                Add binary item
                                            </SmallButton>
                                            <SmallButton onClick={() => addSelectKCriterion(secIdx, bIdx)}
                                                         variant="ghost" title="Select-K item">
                                                Add select-K item
                                            </SmallButton>
                                        </div>
                                    </div>

                                    <div className="space-y-2 px-3 pb-3">
                                        {b.criteria.length === 0 ? (
                                            <div
                                                className="rounded-lg border border-subtle bg-surface px-3 py-2 text-[11px] text-muted">
                                                No items yet.
                                            </div>
                                        ) : (
                                            b.criteria.map((c, cIdx) => {
                                                const isBinary = c.type === "binary";
                                                const keyOk = isBinary ? isValidSnakeKey(c.key) : isValidSnakeKey(c.groupId);

                                                const keyPath = isBinary
                                                    ? `sec.${secId}.block.${b.id}.crit.${cIdx}.key`
                                                    : `sec.${secId}.block.${b.id}.crit.${cIdx}.groupId`;

                                                const critRowKey = `${secId}:${b.id}:${cIdx}`;

                                                return (
                                                    <div key={critRowKey}
                                                         className="rounded-xl border border-subtle app-bg">
                                                        <div
                                                            className="flex items-center justify-between gap-2 border-b border-subtle px-3 py-2">
                                                            <div className="text-[11px] font-semibold text-primary">
                                                                {isBinary ? "Binary item" : "Select-K item"}
                                                            </div>
                                                            <SmallButton
                                                                onClick={() => removeCriterion(secIdx, bIdx, cIdx)}
                                                                variant="ghost" title="Remove this item">
                                                                Remove
                                                            </SmallButton>
                                                        </div>

                                                        <div
                                                            className="grid grid-cols-1 gap-2 px-3 py-3 md:grid-cols-2">
                                                            <label className="space-y-1 md:col-span-2">
                                                                <FieldLabel label="Text"
                                                                            tip="Wording shown to instructors and students."/>
                                                                <TextInput
                                                                    value={c.verbiage}
                                                                    onChange={(v) => {
                                                                        const next = structuredClone(local);
                                                                        next.sections[secIdx].blocks[bIdx].criteria[cIdx].verbiage = v;
                                                                        commit(next);
                                                                    }}
                                                                />
                                                            </label>

                                                            {isBinary ? (
                                                                <>
                                                                    <label className="space-y-1">
                                                                        <FieldLabel label="Key" tip={keyTip}/>
                                                                        <TextInput
                                                                            value={c.key}
                                                                            invalid={showInvalid(keyPath, keyOk)}
                                                                            onBlur={() => markTouched(keyPath)}
                                                                            onChange={(v) => {
                                                                                const next = structuredClone(local);
                                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                if (crit.type === "binary") crit.key = v;
                                                                                commit(next);
                                                                            }}
                                                                        />
                                                                    </label>

                                                                    <label className="space-y-1">
                                                                        <FieldLabel label="Points"
                                                                                    tip="Points earned when satisfied."/>
                                                                        <NumInput
                                                                            value={c.weight}
                                                                            onChange={(v) => {
                                                                                const next = structuredClone(local);
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
                                                                        <FieldLabel label="Group key" tip={keyTip}/>
                                                                        <TextInput
                                                                            value={c.groupId}
                                                                            invalid={showInvalid(keyPath, keyOk)}
                                                                            onBlur={() => markTouched(keyPath)}
                                                                            onChange={(v) => {
                                                                                const next = structuredClone(local);
                                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                if (crit.type === "select_k") crit.groupId = v;
                                                                                commit(next);
                                                                            }}
                                                                        />
                                                                    </label>

                                                                    <label className="space-y-1">
                                                                        <FieldLabel label="Pick how many"
                                                                                    tip={pickKTip}/>
                                                                        <NumInput
                                                                            value={c.selectK}
                                                                            onChange={(v) => {
                                                                                const next = structuredClone(local);
                                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                if (crit.type === "select_k") crit.selectK = Math.max(1, Math.floor(v));
                                                                                commit(next);
                                                                            }}
                                                                        />
                                                                    </label>

                                                                    <label className="space-y-1">
                                                                        <FieldLabel label="Points"
                                                                                    tip="Points earned once enough correct choices are picked."/>
                                                                        <NumInput
                                                                            value={c.awardPoints}
                                                                            onChange={(v) => {
                                                                                const next = structuredClone(local);
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
                                                            <div className="border-t border-subtle px-3 py-3">
                                                                <div
                                                                    className="flex items-center justify-between gap-2">
                                                                    <div
                                                                        className="flex items-center gap-2 text-[11px] font-semibold text-primary">
                                                                        Choices
                                                                        <TooltipBadge
                                                                            tip="These are the options students can pick from."/>
                                                                    </div>

                                                                    <SmallButton
                                                                        onClick={() => addSelectKItem(secIdx, bIdx, cIdx)}
                                                                        variant="secondary"
                                                                        title="Add a new choice"
                                                                    >
                                                                        Add choice
                                                                    </SmallButton>
                                                                </div>

                                                                <div className="mt-2 space-y-2">
                                                                    {c.items.map((it, itIdx) => {
                                                                        const itemKeyOk = isValidSnakeKey(it.key);
                                                                        const itemKeyPath = `sec.${secId}.block.${b.id}.crit.${cIdx}.item.${itIdx}.key`;
                                                                        const itemRowKey = `${secId}:${b.id}:${cIdx}:${itIdx}`;

                                                                        return (
                                                                            <div key={itemRowKey}
                                                                                 className="rounded-lg border border-subtle app-bg p-2">
                                                                                <div
                                                                                    className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                                                                    <label className="space-y-1">
                                                                                        <FieldLabel label="Key"
                                                                                                    tip={keyTip}/>
                                                                                        <TextInput
                                                                                            value={it.key}
                                                                                            invalid={showInvalid(itemKeyPath, itemKeyOk)}
                                                                                            onBlur={() => markTouched(itemKeyPath)}
                                                                                            onChange={(v) => {
                                                                                                const next = structuredClone(local);
                                                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                if (crit.type === "select_k") crit.items[itIdx].key = v;
                                                                                                commit(next);
                                                                                            }}
                                                                                        />
                                                                                    </label>

                                                                                    <label
                                                                                        className="space-y-1 md:col-span-2">
                                                                                        <FieldLabel label="Text"
                                                                                                    tip="Shown as a choice inside this item."/>
                                                                                        <TextInput
                                                                                            value={it.verbiage}
                                                                                            onChange={(v) => {
                                                                                                const next = structuredClone(local);
                                                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                if (crit.type === "select_k") crit.items[itIdx].verbiage = v;
                                                                                                commit(next);
                                                                                            }}
                                                                                        />
                                                                                    </label>
                                                                                </div>

                                                                                <div className="mt-2 flex justify-end">
                                                                                    <SmallButton
                                                                                        onClick={() => removeSelectKItem(secIdx, bIdx, cIdx, itIdx)}
                                                                                        variant="ghost"
                                                                                        disabled={c.items.length <= 1}
                                                                                        title={c.items.length <= 1 ? "At least one choice is required." : "Remove this choice"}
                                                                                    >
                                                                                        Remove choice
                                                                                    </SmallButton>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    const evidenceTip =
        'These are short evidence keys used by the grader. Use simple keys like "onset_lt_36hr". Keep them consistent once students start using the rubric.';

    return (
        <div className="space-y-3">
            <Card
                title="Rubric Details"
                open={open.details}
                onToggle={() => setOpen((s) => ({...s, details: !s.details}))}
            >
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <label className="space-y-1">
                        <FieldLabel label="Rubric id" tip="This is fixed for the disease and cannot be changed."/>
                        <TextInput disabled value={local.rubricId} onChange={() => {
                        }}/>
                    </label>

                    <label className="space-y-1">
                        <FieldLabel label="Rubric version"
                                    tip="Example: 1.1 for small updates, 2.0 for bigger updates."/>
                        <TextInput value={local.rubricVersion} onChange={(v) => commit({...local, rubricVersion: v})}/>
                    </label>

                    <label className="space-y-1">
                        <FieldLabel label="Schema version" tip="This is fixed by the app and cannot be changed."/>
                        <TextInput disabled value={local.schemaVersion} onChange={() => {
                        }}/>
                    </label>
                </div>
            </Card>

            <Card
                title="Evidence Keys"
                open={open.evidence}
                onToggle={() => setOpen((s) => ({...s, evidence: !s.evidence}))}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-primary">
                            Keys <span className="ml-1 inline-flex"><TooltipBadge tip={evidenceTip}/></span>
                        </div>
                    </div>
                    <div className="w-[140px]">
                        <SmallButton onClick={addEvidenceKey} variant="secondary" title="Add a new evidence key"
                                     fullWidth>
                            Add key
                        </SmallButton>
                    </div>
                </div>

                {local.evidenceKeys.length === 0 ? (
                    <div className="mt-2 rounded-xl border border-subtle bg-surface px-3 py-2 text-[11px] text-muted">
                        No evidence keys yet.
                    </div>
                ) : (
                    <div className="mt-2 space-y-2">
                        {local.evidenceKeys.map((k, idx) => {
                            const ok = isValidSnakeKey(k);
                            const path = `evidenceKeys.${idx}`;

                            return (
                                <div
                                    key={evidenceRowIdsRef.current[idx]}
                                    className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px] md:items-end"
                                >
                                    <div className="space-y-1">
                                        <FieldLabel label={`Key ${idx + 1}`}/>
                                        <TextInput
                                            value={k}
                                            placeholder="onset_lt_36hr"
                                            invalid={showInvalid(path, ok)}
                                            onBlur={() => markTouched(path)}
                                            onChange={(v) => {
                                                const next = structuredClone(local);
                                                next.evidenceKeys[idx] = v;
                                                commit(next);
                                            }}
                                        />
                                    </div>

                                    <SmallButton onClick={() => removeEvidenceKey(idx)} variant="ghost"
                                                 title="Remove this key" fullWidth>
                                        Remove
                                    </SmallButton>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-3 flex justify-end">
                    <div className="w-[140px]">
                        <SmallButton onClick={addEvidenceKey} variant="secondary" title="Add a new evidence key"
                                     fullWidth>
                            Add key
                        </SmallButton>
                    </div>
                </div>
            </Card>

            <Card
                title="Identification"
                open={open.identification}
                onToggle={() => setOpen((s) => ({...s, identification: !s.identification}))}
            >
                {renderSection("identification")}
            </Card>

            <Card
                title="Explanation"
                open={open.explanation}
                onToggle={() => setOpen((s) => ({...s, explanation: !s.explanation}))}
            >
                {renderSection("explanation")}
            </Card>

            <Card
                title="Plan/Recommendation"
                open={open.plan_recommendation}
                onToggle={() => setOpen((s) => ({...s, plan_recommendation: !s.plan_recommendation}))}
            >
                {renderSection("plan_recommendation")}
            </Card>

            <Card
                title="Monitoring"
                open={open.monitoring}
                onToggle={() => setOpen((s) => ({...s, monitoring: !s.monitoring}))}
            >
                {renderSection("monitoring")}
            </Card>
        </div>
    );
}
