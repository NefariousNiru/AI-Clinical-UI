// file: src/pages/admin/rubric/RubricFormattedEditable.tsx

import React, {useEffect, useMemo, useRef, useState} from "react";
import type {RubricJson, SelectKCriterion, BinaryCriterion} from "../../../lib/types/rubricSchema";
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
                    <div className="text-sm font-semibold text-primary">{capitalizeFirst(title)}</div>
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

function ChevronToggle({
                           open,
                           onToggle,
                           title,
                       }: {
    open: boolean;
    onToggle: () => void;
    title?: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className={[
                "inline-flex h-8 w-8 items-center justify-center rounded-full",
                "border border-subtle bg-surface text-primary hover:bg-surface-subtle",
            ].join(" ")}
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={open}
        >
            {open ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
        </button>
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

function TextArea({
                      value,
                      onChange,
                      disabled = false,
                      placeholder,
                  }: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <textarea
            disabled={disabled}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={[
                "min-h-[64px] w-full rounded-2xl border border-subtle bg-surface px-3 py-2",
                "text-xs leading-relaxed text-primary placeholder:text-muted",
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
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
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

function stringifyJsonValue(v: unknown): string {
    if (v === null || v === undefined) return "";
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return "";
    }
}

function safeParseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
    const trimmed = text.trim();
    if (!trimmed) return {ok: true, value: null};
    try {
        const v: unknown = JSON.parse(trimmed);
        return {ok: true, value: v};
    } catch {
        return {ok: false, error: "Invalid JSON"};
    }
}

function JsonTextArea({
                          label,
                          tip,
                          value,
                          onCommit,
                          placeholder,
                      }: {
    label: string;
    tip?: string;
    value: unknown;
    onCommit: (v: unknown) => void;
    placeholder?: string;
}) {
    const [text, setText] = useState<string>(() => stringifyJsonValue(value));
    const [bad, setBad] = useState<boolean>(false);

    useEffect(() => {
        setText(stringifyJsonValue(value));
        setBad(false);
    }, [value]);

    return (
        <label className="space-y-1">
            <FieldLabel label={label} tip={tip}/>
            <textarea
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    setBad(false);
                }}
                onBlur={() => {
                    const parsed = safeParseJson(text);
                    if (!parsed.ok) {
                        setBad(true);
                        return;
                    }
                    setBad(false);
                    onCommit(parsed.value);
                }}
                placeholder={placeholder ?? "{\n  \n}"}
                className={[
                    "min-h-[88px] w-full rounded-2xl border bg-surface px-3 py-2 font-mono text-[11px] leading-relaxed text-primary",
                    bad ? "border-danger" : "border-subtle",
                    "focus:outline-none focus:border-strong",
                ].join(" ")}
                spellCheck={false}
            />
            {bad ? <div className="text-[11px] text-danger">Invalid JSON</div> : null}
        </label>
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
    // Sections: only details open by default (everything else closed)
    const [open, setOpen] = useState({
        details: true,
        evidence: false,
        non_scored: false,
        identification: false,
        explanation: false,
        plan_recommendation: false,
        monitoring: false,
    });

    // Nested collapse state: default is closed for everything unless user toggles
    const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [openChoices, setOpenChoices] = useState<Record<string, boolean>>({});

    const [local, setLocal] = useState<RubricJson>(draft);

    const rubricKey = `${draft.rubricId}::${draft.schemaVersion}::${draft.rubricVersion}`;
    const lastRubricKeyRef = useRef<string>(rubricKey);

    const [touched, setTouched] = useState<Record<string, true>>({});

    const evidenceRowIdsRef = useRef<string[]>([]);
    const nonScoredRowIdsRef = useRef<string[]>([]);

    // Stable UI ids for criterion rows per block, and choice rows per select-k item
    const critRowIdsRef = useRef<Record<string, string[]>>({});
    const choiceRowIdsRef = useRef<Record<string, string[]>>({});

    useEffect(() => {
        if (lastRubricKeyRef.current !== rubricKey) {
            lastRubricKeyRef.current = rubricKey;
            setLocal(draft);
            setTouched({});

            evidenceRowIdsRef.current = [];
            nonScoredRowIdsRef.current = [];

            critRowIdsRef.current = {};
            choiceRowIdsRef.current = {};

            setOpenBlocks({});
            setOpenItems({});
            setOpenChoices({});
        }
    }, [rubricKey, draft]);

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

    function ensureEvidenceRowIds(len: number) {
        const ids = evidenceRowIdsRef.current;
        while (ids.length < len) ids.push(newId("evk"));
        if (ids.length > len) ids.splice(len);
    }

    function ensureNonScoredRowIds(len: number) {
        const ids = nonScoredRowIdsRef.current;
        while (ids.length < len) ids.push(newId("nsn"));
        if (ids.length > len) ids.splice(len);
    }

    function ensureCritRowIds(blockKey: string, len: number) {
        const m = critRowIdsRef.current;
        const ids = (m[blockKey] ??= []);
        while (ids.length < len) ids.push(newId("crit"));
        if (ids.length > len) ids.splice(len);
    }

    function ensureChoiceRowIds(choiceRootKey: string, len: number) {
        const m = choiceRowIdsRef.current;
        const ids = (m[choiceRootKey] ??= []);
        while (ids.length < len) ids.push(newId("ch"));
        if (ids.length > len) ids.splice(len);
    }

    ensureEvidenceRowIds(local.evidenceKeys.length);
    ensureNonScoredRowIds(local.nonScoredClinicalNotes.length);

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

    function addNonScoredNote() {
        const next = structuredClone(local);
        next.nonScoredClinicalNotes.push("");
        commit(next);
    }

    function removeNonScoredNote(idx: number) {
        const next = structuredClone(local);
        next.nonScoredClinicalNotes.splice(idx, 1);
        commit(next);
    }

    function addBlock(secIdx: number) {
        const next = structuredClone(local);
        const secId = next.sections[secIdx].id;

        const id = newId("block");
        next.sections[secIdx].blocks.push({
            id,
            title: "New block",
            maxPoints: 0,
            criteria: [],
            notes: "",
        });

        // Treat "Add block" click as intent to work on it - open that block (but nothing inside auto-expands)
        const blockKey = `${secId}:${id}`;
        setOpenBlocks((m) => ({...m, [blockKey]: true}));

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
        const secId = local.sections[secIdx].id;
        const blockId = local.sections[secIdx].blocks[bIdx].id;
        const blockKey = `${secId}:${blockId}`;

        // ensure ids for existing + new
        const curLen = local.sections[secIdx].blocks[bIdx].criteria.length;
        ensureCritRowIds(blockKey, curLen + 1);
        const newCritId = critRowIdsRef.current[blockKey][curLen];

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

        // User clicked add - open just this item (choices remain closed)
        setOpenItems((m) => ({...m, [newCritId]: true}));

        commit(next);
    }

    function addSelectKCriterion(secIdx: number, bIdx: number) {
        const secId = local.sections[secIdx].id;
        const blockId = local.sections[secIdx].blocks[bIdx].id;
        const blockKey = `${secId}:${blockId}`;

        const curLen = local.sections[secIdx].blocks[bIdx].criteria.length;
        ensureCritRowIds(blockKey, curLen + 1);
        const newCritId = critRowIdsRef.current[blockKey][curLen];

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

        setOpenItems((m) => ({...m, [newCritId]: true}));

        commit(next);
    }

    function removeCriterion(secIdx: number, bIdx: number, cIdx: number) {
        const next = structuredClone(local);
        next.sections[secIdx].blocks[bIdx].criteria.splice(cIdx, 1);
        commit(next);
    }

    function addSelectKItem(secIdx: number, bIdx: number, cIdx: number) {
        const secId = local.sections[secIdx].id;
        const blockId = local.sections[secIdx].blocks[bIdx].id;
        const blockKey = `${secId}:${blockId}`;

        ensureCritRowIds(blockKey, local.sections[secIdx].blocks[bIdx].criteria.length);
        const critId = critRowIdsRef.current[blockKey][cIdx];
        const choiceRootKey = `${blockKey}:${critId}`;

        const crit = local.sections[secIdx].blocks[bIdx].criteria[cIdx];
        if (crit.type !== "select_k") return;

        const curLen = crit.items.length;
        ensureChoiceRowIds(choiceRootKey, curLen + 1);
        const newChoiceId = choiceRowIdsRef.current[choiceRootKey][curLen];

        const next = structuredClone(local);
        const nextCrit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
        if (nextCrit.type !== "select_k") return;

        nextCrit.items.push({key: "new_item", verbiage: "New choice", notes: null, aliases: null});

        setOpenChoices((m) => ({...m, [newChoiceId]: true}));

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

        const keyTip = 'Use short concise keywords like "onset_lt_36hr" for LLM.';
        const pickKTip = "If there are multiple correct options, picking at least K correct choices earns the points.";

        return (
            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <label className="space-y-1 md:col-span-2">
                        <FieldLabel label="Title" tip="Section title"/>
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
                        <FieldLabel label="Total points" tip="Updates automatically (cumulative) based on items below."/>
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
                            const blockKey = `${secId}:${b.id}`;

                            const blockIsOpen = openBlocks[blockKey];

                            // Ensure stable row ids for criteria in this block
                            ensureCritRowIds(blockKey, b.criteria.length);
                            const critIds = critRowIdsRef.current[blockKey];

                            return (
                                <div key={b.id} className="rounded-xl border border-subtle app-bg shadow-sm">
                                    {/* Block header (NOT a button) */}
                                    <div
                                        className="flex flex-wrap items-center justify-between gap-2 border-b border-subtle px-3 py-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="text-[12px] font-semibold text-primary">
                                                    {b.title || "Untitled block"}
                                                </div>
                                                <div className="text-[11px] text-muted">
                                                    {b.criteria.length} items · {b.maxPoints} pts
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <SmallButton
                                                onClick={() => removeBlock(secIdx, bIdx)}
                                                variant="ghost"
                                                disabled={!canRemove}
                                                title={!canRemove ? "This block is required." : "Remove this block"}
                                            >
                                                Remove
                                            </SmallButton>

                                            <ChevronToggle
                                                open={blockIsOpen}
                                                onToggle={() =>
                                                    setOpenBlocks((m) => ({...m, [blockKey]: !m[blockKey]}))
                                                }
                                                title={blockIsOpen ? "Collapse block" : "Expand block"}
                                            />
                                        </div>
                                    </div>

                                    {/* Block body */}
                                    {blockIsOpen ? (
                                        <div className="px-3 pb-3 pt-3 space-y-3">
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
                                                    <FieldLabel
                                                        label="Total points"
                                                        tip="Updates automatically (cumulative) based on items below."
                                                    />
                                                    <NumInput value={b.maxPoints} onChange={() => {
                                                    }} disabled/>
                                                </label>

                                                <label className="space-y-1 md:col-span-3">
                                                    <FieldLabel
                                                        label="Block notes"
                                                        tip="Optional block level notes to coerce LLM to behave a particular way"
                                                    />
                                                    <TextArea
                                                        value={b.notes ?? ""}
                                                        onChange={(v) => {
                                                            const next = structuredClone(local);
                                                            next.sections[secIdx].blocks[bIdx].notes = v;
                                                            commit(next);
                                                        }}
                                                        placeholder="Optional notes for this block"
                                                    />
                                                </label>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="text-[11px] text-muted">
                                                    Add items to define what earns points.
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <SmallButton
                                                        onClick={() => addBinaryCriterion(secIdx, bIdx)}
                                                        variant="ghost"
                                                        title="Binary item"
                                                    >
                                                        Add binary item
                                                    </SmallButton>
                                                    <SmallButton
                                                        onClick={() => addSelectKCriterion(secIdx, bIdx)}
                                                        variant="ghost"
                                                        title="Select-K item"
                                                    >
                                                        Add select-K item
                                                    </SmallButton>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {b.criteria.length === 0 ? (
                                                    <div
                                                        className="rounded-lg border border-subtle bg-surface px-3 py-2 text-[11px] text-muted">
                                                        No items yet.
                                                    </div>
                                                ) : (
                                                    b.criteria.map((c, cIdx) => {
                                                        const isBinary = c.type === "binary";

                                                        const keyOk = isBinary
                                                            ? isValidSnakeKey((c as BinaryCriterion).key)
                                                            : isValidSnakeKey((c as SelectKCriterion).groupId);

                                                        const keyPath = isBinary
                                                            ? `sec.${secId}.block.${b.id}.crit.${cIdx}.key`
                                                            : `sec.${secId}.block.${b.id}.crit.${cIdx}.groupId`;

                                                        const critId = critIds[cIdx];
                                                        const itemIsOpen = openItems[critId];

                                                        const critNotes =
                                                            c.type === "binary"
                                                                ? (c as BinaryCriterion).notes
                                                                : (c as SelectKCriterion).notes;

                                                        const summaryRight = isBinary
                                                            ? `${(c as BinaryCriterion).key || "key"} · ${(c as BinaryCriterion).weight} pts`
                                                            : `${(c as SelectKCriterion).groupId || "group"} · pick ${(c as SelectKCriterion).selectK} · ${(c as SelectKCriterion).awardPoints} pts · ${(c as SelectKCriterion).items.length} choices`;

                                                        return (
                                                            <div key={critId}
                                                                 className="rounded-xl border border-subtle app-bg">
                                                                {/* Item header (NOT a button) */}
                                                                <div
                                                                    className="flex items-center justify-between gap-2 border-b border-subtle px-3 py-2">
                                                                    <div className="min-w-0">
                                                                        <div
                                                                            className="text-[11px] font-semibold text-primary">
                                                                            {isBinary ? "Binary item" : "Select-K item"}
                                                                        </div>
                                                                        <div className="text-[11px] text-muted">
                                                                            {summaryRight}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <SmallButton
                                                                            onClick={() => removeCriterion(secIdx, bIdx, cIdx)}
                                                                            variant="ghost"
                                                                            title="Remove this item"
                                                                        >
                                                                            Remove
                                                                        </SmallButton>

                                                                        <ChevronToggle
                                                                            open={itemIsOpen}
                                                                            onToggle={() =>
                                                                                setOpenItems((m) => ({
                                                                                    ...m,
                                                                                    [critId]: !m[critId]
                                                                                }))
                                                                            }
                                                                            title={itemIsOpen ? "Collapse item" : "Expand item"}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Item body */}
                                                                {itemIsOpen ? (
                                                                    <>
                                                                        <div
                                                                            className="grid grid-cols-1 gap-2 px-3 py-3 md:grid-cols-2">
                                                                            <label className="space-y-1 md:col-span-2">
                                                                                <FieldLabel
                                                                                    label="Text"
                                                                                    tip="General words to describe a correct answer"
                                                                                />
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
                                                                                        <FieldLabel label="Key"
                                                                                                    tip={keyTip}/>
                                                                                        <TextInput
                                                                                            value={(c as BinaryCriterion).key}
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
                                                                                            value={(c as BinaryCriterion).weight}
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
                                                                                        <FieldLabel label="Group key"
                                                                                                    tip={keyTip}/>
                                                                                        <TextInput
                                                                                            value={(c as SelectKCriterion).groupId}
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
                                                                                        <FieldLabel
                                                                                            label="Pick how many"
                                                                                            tip={pickKTip}/>
                                                                                        <NumInput
                                                                                            value={(c as SelectKCriterion).selectK}
                                                                                            onChange={(v) => {
                                                                                                const next = structuredClone(local);
                                                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                if (crit.type === "select_k") crit.selectK = Math.max(1, Math.floor(v));
                                                                                                commit(next);
                                                                                            }}
                                                                                        />
                                                                                    </label>

                                                                                    <label className="space-y-1">
                                                                                        <FieldLabel
                                                                                            label="Points"
                                                                                            tip="Points earned once enough (k) correct choices are picked."
                                                                                        />
                                                                                        <NumInput
                                                                                            value={(c as SelectKCriterion).awardPoints}
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

                                                                            <label className="space-y-1 md:col-span-2">
                                                                                <FieldLabel
                                                                                    label="Item notes"
                                                                                    tip="Optional item level notes to coerce LLM to behave a particular way"
                                                                                />
                                                                                <TextArea
                                                                                    value={critNotes ?? ""}
                                                                                    onChange={(v) => {
                                                                                        const next = structuredClone(local);
                                                                                        const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                        if (crit.type === "binary") crit.notes = v;
                                                                                        if (crit.type === "select_k") crit.notes = v;
                                                                                        commit(next);
                                                                                    }}
                                                                                    placeholder="Optional notes for this item"
                                                                                />
                                                                            </label>

                                                                            {c.type === "binary" ? (
                                                                                <>
                                                                                    <JsonTextArea
                                                                                        label="Aliases (JSON)"
                                                                                        tip="Store keyword aliases. Optional. Stored as JSON. Leave blank to clear."
                                                                                        value={(c as BinaryCriterion).aliases}
                                                                                        onCommit={(v) => {
                                                                                            const next = structuredClone(local);
                                                                                            const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                            if (crit.type === "binary") crit.aliases = v;
                                                                                            commit(next);
                                                                                        }}
                                                                                        placeholder='{"alt": ["..."]}'
                                                                                    />
                                                                                    <JsonTextArea
                                                                                        label="Unit equivalents (JSON)"
                                                                                        tip='Optional. Example: [{"mg": {"1": 1}}]. Leave blank to clear.'
                                                                                        value={(c as BinaryCriterion).unitEquivalents}
                                                                                        onCommit={(v) => {
                                                                                            const next = structuredClone(local);
                                                                                            const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                            if (crit.type !== "binary") return;
                                                                                            if (v === null) crit.unitEquivalents = null;
                                                                                            else if (Array.isArray(v))
                                                                                                crit.unitEquivalents = v as unknown as Array<Record<string, Record<string, number>>>;
                                                                                            commit(next);
                                                                                        }}
                                                                                        placeholder='[{"mg": {"1": 1}}]'
                                                                                    />
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <label className="space-y-1">
                                                                                        <FieldLabel
                                                                                            label="Min items required"
                                                                                            tip="Optional. Minimum choices student must write from k choices else 0."
                                                                                        />
                                                                                        <NumInput
                                                                                            value={(c as SelectKCriterion).minItemsRequired ?? 0}
                                                                                            onChange={(v) => {
                                                                                                const next = structuredClone(local);
                                                                                                const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                if (crit.type === "select_k")
                                                                                                    crit.minItemsRequired = Math.max(0, Math.floor(v));
                                                                                                commit(next);
                                                                                            }}
                                                                                            title="Set to 0 if not used"
                                                                                        />
                                                                                    </label>

                                                                                    <JsonTextArea
                                                                                        label="Depends on any (JSON array)"
                                                                                        tip='Optional. Example: ["some_key"]. Leave blank to clear.'
                                                                                        value={(c as SelectKCriterion).dependsOnAny}
                                                                                        onCommit={(v) => {
                                                                                            const next = structuredClone(local);
                                                                                            const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                            if (crit.type !== "select_k") return;
                                                                                            if (v === null) crit.dependsOnAny = null;
                                                                                            else if (Array.isArray(v)) crit.dependsOnAny = v as unknown as string[];
                                                                                            commit(next);
                                                                                        }}
                                                                                        placeholder='["some_key"]'
                                                                                    />

                                                                                    <JsonTextArea
                                                                                        label="Unit equivalents (JSON)"
                                                                                        tip='Optional. Example: [{"mg": {"1": 1}}]. Leave blank to clear.'
                                                                                        value={(c as SelectKCriterion).unitEquivalents}
                                                                                        onCommit={(v) => {
                                                                                            const next = structuredClone(local);
                                                                                            const crit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                            if (crit.type !== "select_k") return;
                                                                                            if (v === null) crit.unitEquivalents = null;
                                                                                            else if (Array.isArray(v))
                                                                                                crit.unitEquivalents = v as unknown as Array<Record<string, Record<string, number>>>;
                                                                                            commit(next);
                                                                                        }}
                                                                                        placeholder='[{"mg": {"1": 1}}]'
                                                                                    />
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        {/* Choices (select-k) */}
                                                                        {c.type === "select_k" ? (
                                                                            <div
                                                                                className="border-t border-subtle px-3 py-3">
                                                                                <div
                                                                                    className="flex items-center justify-between gap-2">
                                                                                    <div
                                                                                        className="flex items-center gap-2 text-[11px] font-semibold text-primary">
                                                                                        Choices
                                                                                        <TooltipBadge
                                                                                            tip="These are the options from which student must answer k"/>
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
                                                                                    {(() => {
                                                                                        const crit = c as SelectKCriterion;
                                                                                        const choiceRootKey = `${blockKey}:${critId}`;
                                                                                        ensureChoiceRowIds(choiceRootKey, crit.items.length);
                                                                                        const choiceIds = choiceRowIdsRef.current[choiceRootKey];

                                                                                        return crit.items.map((it, itIdx) => {
                                                                                            const choiceId = choiceIds[itIdx];
                                                                                            const choiceIsOpen = openChoices[choiceId];

                                                                                            const itemKeyOk = isValidSnakeKey(it.key);
                                                                                            const itemKeyPath = `sec.${secId}.block.${b.id}.crit.${cIdx}.item.${itIdx}.key`;

                                                                                            return (
                                                                                                <div key={choiceId}
                                                                                                     className="rounded-lg border border-subtle app-bg">
                                                                                                    {/* Choice header */}
                                                                                                    <div
                                                                                                        className="flex items-center justify-between gap-2 border-b border-subtle px-2 py-2">
                                                                                                        <div
                                                                                                            className="min-w-0">
                                                                                                            <div
                                                                                                                className="text-[11px] font-semibold text-primary">
                                                                                                                {it.key || "choice_key"}
                                                                                                            </div>
                                                                                                            <div
                                                                                                                className="text-[11px] text-muted truncate">
                                                                                                                {it.verbiage || "Choice text"}
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div
                                                                                                            className="flex items-center gap-2">
                                                                                                            <SmallButton
                                                                                                                onClick={() =>
                                                                                                                    removeSelectKItem(secIdx, bIdx, cIdx, itIdx)
                                                                                                                }
                                                                                                                variant="ghost"
                                                                                                                disabled={crit.items.length <= 1}
                                                                                                                title={
                                                                                                                    crit.items.length <= 1
                                                                                                                        ? "At least one choice is required."
                                                                                                                        : "Remove this choice"
                                                                                                                }
                                                                                                            >
                                                                                                                Remove
                                                                                                            </SmallButton>

                                                                                                            <ChevronToggle
                                                                                                                open={choiceIsOpen}
                                                                                                                onToggle={() =>
                                                                                                                    setOpenChoices((m) => ({
                                                                                                                        ...m,
                                                                                                                        [choiceId]: !m[choiceId],
                                                                                                                    }))
                                                                                                                }
                                                                                                                title={choiceIsOpen ? "Collapse choice" : "Expand choice"}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Choice body */}
                                                                                                    {choiceIsOpen ? (
                                                                                                        <div
                                                                                                            className="p-2">
                                                                                                            <div
                                                                                                                className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                                                                                                <label
                                                                                                                    className="space-y-1">
                                                                                                                    <FieldLabel
                                                                                                                        label="Key"
                                                                                                                        tip={keyTip}/>
                                                                                                                    <TextInput
                                                                                                                        value={it.key}
                                                                                                                        invalid={showInvalid(itemKeyPath, itemKeyOk)}
                                                                                                                        onBlur={() => markTouched(itemKeyPath)}
                                                                                                                        onChange={(v) => {
                                                                                                                            const next = structuredClone(local);
                                                                                                                            const nextCrit =
                                                                                                                                next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                                            if (nextCrit.type === "select_k")
                                                                                                                                nextCrit.items[itIdx].key = v;
                                                                                                                            commit(next);
                                                                                                                        }}
                                                                                                                    />
                                                                                                                </label>

                                                                                                                <label
                                                                                                                    className="space-y-1 md:col-span-2">
                                                                                                                    <FieldLabel
                                                                                                                        label="Text"
                                                                                                                        tip="Shown as a choice inside this item."/>
                                                                                                                    <TextInput
                                                                                                                        value={it.verbiage}
                                                                                                                        onChange={(v) => {
                                                                                                                            const next = structuredClone(local);
                                                                                                                            const nextCrit =
                                                                                                                                next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                                            if (nextCrit.type === "select_k")
                                                                                                                                nextCrit.items[itIdx].verbiage = v;
                                                                                                                            commit(next);
                                                                                                                        }}
                                                                                                                    />
                                                                                                                </label>

                                                                                                                <label
                                                                                                                    className="space-y-1 md:col-span-3">
                                                                                                                    <FieldLabel
                                                                                                                        label="Choice notes"
                                                                                                                        tip="Optional choice level notes to coerce LLM to behave a particular way"/>
                                                                                                                    <TextArea
                                                                                                                        value={it.notes ?? ""}
                                                                                                                        onChange={(v) => {
                                                                                                                            const next = structuredClone(local);
                                                                                                                            const nextCrit =
                                                                                                                                next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                                            if (nextCrit.type === "select_k")
                                                                                                                                nextCrit.items[itIdx].notes = v;
                                                                                                                            commit(next);
                                                                                                                        }}
                                                                                                                        placeholder="Optional notes for this choice"
                                                                                                                    />
                                                                                                                </label>

                                                                                                                <div
                                                                                                                    className="md:col-span-3">
                                                                                                                    <JsonTextArea
                                                                                                                        label="Choice aliases (JSON)"
                                                                                                                        tip="Optional. Stored as JSON. Leave blank to clear."
                                                                                                                        value={it.aliases}
                                                                                                                        onCommit={(v) => {
                                                                                                                            const next = structuredClone(local);
                                                                                                                            const nextCrit =
                                                                                                                                next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                                            if (nextCrit.type === "select_k")
                                                                                                                                nextCrit.items[itIdx].aliases = v;
                                                                                                                            commit(next);
                                                                                                                        }}
                                                                                                                        placeholder='{"alt": ["..."]}'
                                                                                                                    />
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ) : null}
                                                                                                </div>
                                                                                            );
                                                                                        });
                                                                                    })()}
                                                                                </div>
                                                                            </div>
                                                                        ) : null}
                                                                    </>
                                                                ) : null}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    const evidenceTip =
        'These are short evidence keys used by the LLM. Use simple and concise keys like "onset_lt_36hr"';

    const nonScoredTip =
        "Non-scored notes are feedback-only. They do not change the score, but should be shown if the student misses important clinical considerations.";

    return (
        <div className="space-y-3">
            <Card
                title="Rubric Details"
                open={open.details}
                onToggle={() => setOpen((s) => ({...s, details: !s.details}))}
            >
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <label className="space-y-1">
                        <FieldLabel label="Rubric id" tip="Fixed for the disease and cannot be changed."/>
                        <TextInput disabled value={local.rubricId} onChange={() => {
                        }}/>
                    </label>

                    <label className="space-y-1">
                        <FieldLabel label="Rubric version"
                                    tip="Example: 1 -> 1.1 for small updates, 1.0 -> 2.0 for bigger updates."/>
                        <TextInput value={local.rubricVersion} onChange={(v) => commit({...local, rubricVersion: v})}/>
                    </label>

                    <label className="space-y-1">
                        <FieldLabel label="Schema version" tip="Fixed by the app and cannot be changed."/>
                        <TextInput disabled value={local.schemaVersion} onChange={() => {
                        }}/>
                    </label>

                    <label className="space-y-1 md:col-span-3">
                        <FieldLabel label="Scoring notes" tip="Optional scoring related notes applicable to whole rubric"/>
                        <TextArea
                            value={local.scoringInvariants.notes ?? ""}
                            onChange={(v) => {
                                const next = structuredClone(local);
                                next.scoringInvariants.notes = v;
                                commit(next);
                            }}
                            placeholder="Optional notes about scoring behavior"
                        />
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

            <Card
                title="Non-Scored Clinical Notes"
                open={open.non_scored}
                onToggle={() => setOpen((s) => ({...s, non_scored: !s.non_scored}))}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-primary">
                            Notes <span className="ml-1 inline-flex"><TooltipBadge tip={nonScoredTip}/></span>
                        </div>
                    </div>
                    <div className="w-[140px]">
                        <SmallButton onClick={addNonScoredNote} variant="secondary" title="Add a new note" fullWidth>
                            Add note
                        </SmallButton>
                    </div>
                </div>

                {local.nonScoredClinicalNotes.length === 0 ? (
                    <div className="mt-2 rounded-xl border border-subtle bg-surface px-3 py-2 text-[11px] text-muted">
                        No notes yet.
                    </div>
                ) : (
                    <div className="mt-2 space-y-2">
                        {local.nonScoredClinicalNotes.map((n, idx) => (
                            <div
                                key={nonScoredRowIdsRef.current[idx]}
                                className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px] md:items-end"
                            >
                                <div className="space-y-1">
                                    <FieldLabel label={`Note ${idx + 1}`}/>
                                    <TextArea
                                        value={n}
                                        onChange={(v) => {
                                            const next = structuredClone(local);
                                            next.nonScoredClinicalNotes[idx] = v;
                                            commit(next);
                                        }}
                                        placeholder="Feedback-only clinical note"
                                    />
                                </div>

                                <SmallButton
                                    onClick={() => removeNonScoredNote(idx)}
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
            </Card>
        </div>
    );
}
