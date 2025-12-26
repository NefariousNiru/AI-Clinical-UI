// file: src/pages/admin/rubric/RubricSectionEditor.tsx

import React from "react";
import {
    ChevronToggle,
    FieldLabel,
    JsonTextArea,
    NumInput,
    SmallButton,
    TextArea,
    TextInput,
    TooltipBadge
} from "./RubricFormAtoms";
import type {BinaryCriterion, RubricJson, SelectKCriterion} from "../../../lib/types/rubricSchema.ts";
import {isValidSnakeKey} from "../../../lib/utils/rubricEdit.ts";

export function RubricSectionEditor({
                                        secId,
                                        local,
                                        secIdx,
                                        sectionIndexById,
                                        openBlocks,
                                        setOpenBlocks,
                                        openItems,
                                        setOpenItems,
                                        openChoices,
                                        setOpenChoices,
                                        ensureCritRowIds,
                                        ensureChoiceRowIds,
                                        critRowIdsRef,
                                        choiceRowIdsRef,
                                        showInvalid,
                                        markTouched,
                                        onCommitSectionTitle,
                                        onAddBlock,
                                        onRemoveBlock,
                                        onAddBinaryCriterion,
                                        onAddSelectKCriterion,
                                        onRemoveCriterion,
                                        onAddSelectKItem,
                                        onRemoveSelectKItem,
                                        commit,
                                    }: {
    secId: string;
    local: RubricJson;
    secIdx: number;
    sectionIndexById: Map<string, number>;

    openBlocks: Record<string, boolean>;
    setOpenBlocks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

    openItems: Record<string, boolean>;
    setOpenItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

    openChoices: Record<string, boolean>;
    setOpenChoices: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

    ensureCritRowIds: (blockKey: string, len: number) => void;
    ensureChoiceRowIds: (choiceRootKey: string, len: number) => void;
    critRowIdsRef: React.MutableRefObject<Record<string, string[]>>;
    choiceRowIdsRef: React.MutableRefObject<Record<string, string[]>>;

    showInvalid: (path: string, ok: boolean) => boolean;
    markTouched: (path: string) => void;

    onCommitSectionTitle: (secIdx: number, v: string) => void;

    onAddBlock: (secIdx: number) => void;
    onRemoveBlock: (secIdx: number, bIdx: number) => void;

    onAddBinaryCriterion: (secIdx: number, bIdx: number) => void;
    onAddSelectKCriterion: (secIdx: number, bIdx: number) => void;
    onRemoveCriterion: (secIdx: number, bIdx: number, cIdx: number) => void;

    onAddSelectKItem: (secIdx: number, bIdx: number, cIdx: number) => void;
    onRemoveSelectKItem: (secIdx: number, bIdx: number, cIdx: number, itIdx: number) => void;

    commit: (next: RubricJson) => void;
}) {
    const resolvedIdx = sectionIndexById.get(secId);
    if (resolvedIdx === undefined) return null;

    const sec = local.sections[secIdx];

    const keyTip = 'Use short concise keywords like "onset_lt_36hr" for LLM.';
    const pickKTip = "If there are multiple correct options, picking at least K correct choices earns the points.";

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <label className="space-y-1 md:col-span-2">
                    <FieldLabel label="Title" tip="Section title"/>
                    <TextInput value={sec.title} onChange={(v) => onCommitSectionTitle(secIdx, v)}/>
                </label>

                <label className="space-y-1">
                    <FieldLabel label="Total points" tip="Updates automatically (cumulative) based on items below."/>
                    <NumInput value={sec.maxPoints} onChange={() => {
                    }} disabled/>
                </label>
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-primary">Blocks</div>
                <SmallButton onClick={() => onAddBlock(secIdx)} variant="secondary" title="Add a new block">
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

                        ensureCritRowIds(blockKey, b.criteria.length);
                        const critIds = critRowIdsRef.current[blockKey];

                        return (
                            <div key={b.id} className="rounded-xl border border-subtle app-bg shadow-sm">
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
                                            onClick={() => onRemoveBlock(secIdx, bIdx)}
                                            variant="ghost"
                                            disabled={!canRemove}
                                            title={!canRemove ? "This block is required." : "Remove this block"}
                                        >
                                            Remove
                                        </SmallButton>

                                        <ChevronToggle
                                            open={blockIsOpen}
                                            onToggle={() => setOpenBlocks((m) => ({...m, [blockKey]: !m[blockKey]}))}
                                            title={blockIsOpen ? "Collapse block" : "Expand block"}
                                        />
                                    </div>
                                </div>

                                {blockIsOpen ? (
                                    <div className="px-3 pb-3 pt-3 space-y-3">
                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                            <label className="space-y-1 md:col-span-2">
                                                <FieldLabel label="Block title" tip="Group related items together."/>
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
                                                    onClick={() => onAddBinaryCriterion(secIdx, bIdx)}
                                                    variant="ghost"
                                                    title="Binary item"
                                                >
                                                    Add binary item
                                                </SmallButton>
                                                <SmallButton
                                                    onClick={() => onAddSelectKCriterion(secIdx, bIdx)}
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
                                                                        onClick={() => onRemoveCriterion(secIdx, bIdx, cIdx)}
                                                                        variant="ghost"
                                                                        title="Remove this item"
                                                                    >
                                                                        Remove
                                                                    </SmallButton>

                                                                    <ChevronToggle
                                                                        open={itemIsOpen}
                                                                        onToggle={() => setOpenItems((m) => ({
                                                                            ...m,
                                                                            [critId]: !m[critId]
                                                                        }))}
                                                                        title={itemIsOpen ? "Collapse item" : "Expand item"}
                                                                    />
                                                                </div>
                                                            </div>

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
                                                                                    <FieldLabel label="Pick how many"
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
                                                                                    onClick={() => onAddSelectKItem(secIdx, bIdx, cIdx)}
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
                                                                                                            onClick={() => onRemoveSelectKItem(secIdx, bIdx, cIdx, itIdx)}
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
                                                                                                            onToggle={() => setOpenChoices((m) => ({
                                                                                                                ...m,
                                                                                                                [choiceId]: !m[choiceId]
                                                                                                            }))}
                                                                                                            title={choiceIsOpen ? "Collapse choice" : "Expand choice"}
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>

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
                                                                                                                        const nextCrit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                                        if (nextCrit.type === "select_k") nextCrit.items[itIdx].key = v;
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
                                                                                                                        const nextCrit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                                        if (nextCrit.type === "select_k") nextCrit.items[itIdx].verbiage = v;
                                                                                                                        commit(next);
                                                                                                                    }}
                                                                                                                />
                                                                                                            </label>

                                                                                                            <label
                                                                                                                className="space-y-1 md:col-span-3">
                                                                                                                <FieldLabel
                                                                                                                    label="Choice notes"
                                                                                                                    tip="Optional choice level notes to coerce LLM to behave a particular way"
                                                                                                                />
                                                                                                                <TextArea
                                                                                                                    value={it.notes ?? ""}
                                                                                                                    onChange={(v) => {
                                                                                                                        const next = structuredClone(local);
                                                                                                                        const nextCrit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                                        if (nextCrit.type === "select_k") nextCrit.items[itIdx].notes = v;
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
                                                                                                                        const nextCrit = next.sections[secIdx].blocks[bIdx].criteria[cIdx];
                                                                                                                        if (nextCrit.type === "select_k") nextCrit.items[itIdx].aliases = v;
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
