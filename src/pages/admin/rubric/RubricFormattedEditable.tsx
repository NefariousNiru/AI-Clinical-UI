// file: src/pages/admin/rubric/RubricFormattedEditable.tsx

import {useEffect, useMemo, useRef, useState} from "react";
import type {BinaryCriterion, RubricJson, SelectKCriterion} from "../../../lib/types/rubricSchema";
import {newId, recomputeDerivedPoints} from "../../../lib/utils/rubricEdit";
import {Card, FieldLabel, TextArea, TextInput} from "./RubricFormAtoms";
import {EvidenceKeysPanel} from "./EvidenceKeysPanel";
import {NonScoredClinicalNotesPanel} from "./NonScoredClinicalNotesPanel";
import {RubricSectionEditor} from "./RubricSectionEditor";

type Props = {
    draft: RubricJson;
    onChange: (next: RubricJson) => void;
};

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
        non_scored: false,
        identification: false,
        explanation: false,
        plan_recommendation: false,
        monitoring: false,
    });

    const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
    const [openChoices, setOpenChoices] = useState<Record<string, boolean>>({});

    const [local, setLocal] = useState<RubricJson>(draft);

    const rubricKey = `${draft.rubricId}::${draft.schemaVersion}::${draft.rubricVersion}`;
    const lastRubricKeyRef = useRef<string>(rubricKey);

    const [touched, setTouched] = useState<Record<string, true>>({});

    const evidenceRowIdsRef = useRef<string[]>([]);
    const nonScoredRowIdsRef = useRef<string[]>([]);

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

    function prepareAddCriterion(secIdx: number, bIdx: number) {
        const sec = local.sections[secIdx];
        if (!sec) return null;

        const block = sec.blocks[bIdx];
        if (!block) return null;

        const blockKey = `${sec.id}:${block.id}`;
        const curLen = block.criteria.length;

        ensureCritRowIds(blockKey, curLen + 1);
        const newCritId = critRowIdsRef.current[blockKey]?.[curLen];
        if (!newCritId) return null;

        const next = structuredClone(local);
        return { next, newCritId };
    }

    function addCriterion<T extends BinaryCriterion | SelectKCriterion>(
        secIdx: number,
        bIdx: number,
        makeCriterion: () => T
    ) {
        const prep = prepareAddCriterion(secIdx, bIdx);
        if (!prep) return;

        const { next, newCritId } = prep;

        next.sections[secIdx].blocks[bIdx].criteria.push(makeCriterion());

        setOpenItems((m) => ({ ...m, [newCritId]: true }));
        commit(next);
    }


    function addBinaryCriterion(secIdx: number, bIdx: number) {
        addCriterion(secIdx, bIdx, () => ({
            type: "binary",
            key: "new_key",
            verbiage: "New item",
            weight: 0,
            unitEquivalents: null,
            notes: null,
            aliases: null,
        }));
    }

    function addSelectKCriterion(secIdx: number, bIdx: number) {
        addCriterion(secIdx, bIdx, () => ({
            type: "select_k",
            groupId: "new_group",
            verbiage: "New item",
            selectK: 1,
            awardPoints: 0,
            items: [{ key: "new_item", verbiage: "New choice", notes: null, aliases: null }],
            dependsOnAny: null,
            minItemsRequired: null,
            unitEquivalents: null,
            notes: null,
        }));
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
                        <FieldLabel
                            label="Rubric version"
                            tip="Example: 1 -> 1.1 for small updates, 1.0 -> 2.0 for bigger updates."
                        />
                        <TextInput value={local.rubricVersion} onChange={(v) => commit({...local, rubricVersion: v})}/>
                    </label>

                    <label className="space-y-1">
                        <FieldLabel label="Schema version" tip="Fixed by the app and cannot be changed."/>
                        <TextInput disabled value={local.schemaVersion} onChange={() => {
                        }}/>
                    </label>

                    <label className="space-y-1 md:col-span-3">
                        <FieldLabel label="Scoring notes"
                                    tip="Optional scoring related notes applicable to whole rubric"/>
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
                <EvidenceKeysPanel
                    evidenceTip={evidenceTip}
                    evidenceKeys={local.evidenceKeys}
                    evidenceRowIds={evidenceRowIdsRef.current}
                    addEvidenceKey={addEvidenceKey}
                    removeEvidenceKey={removeEvidenceKey}
                    showInvalid={showInvalid}
                    markTouched={markTouched}
                    onChangeKey={(idx, v) => {
                        const next = structuredClone(local);
                        next.evidenceKeys[idx] = v;
                        commit(next);
                    }}
                />
            </Card>

            <Card
                title="Identification"
                open={open.identification}
                onToggle={() => setOpen((s) => ({...s, identification: !s.identification}))}
            >
                {(() => {
                    const secIdx = sectionIndexById.get("identification");
                    if (secIdx === undefined) return null;
                    return (
                        <RubricSectionEditor
                            secId="identification"
                            local={local}
                            secIdx={secIdx}
                            sectionIndexById={sectionIndexById}
                            openBlocks={openBlocks}
                            setOpenBlocks={setOpenBlocks}
                            openItems={openItems}
                            setOpenItems={setOpenItems}
                            openChoices={openChoices}
                            setOpenChoices={setOpenChoices}
                            ensureCritRowIds={ensureCritRowIds}
                            ensureChoiceRowIds={ensureChoiceRowIds}
                            critRowIdsRef={critRowIdsRef}
                            choiceRowIdsRef={choiceRowIdsRef}
                            showInvalid={showInvalid}
                            markTouched={markTouched}
                            onCommitSectionTitle={(idx, v) => {
                                const next = structuredClone(local);
                                next.sections[idx].title = v;
                                commit(next);
                            }}
                            onAddBlock={addBlock}
                            onRemoveBlock={removeBlock}
                            onAddBinaryCriterion={addBinaryCriterion}
                            onAddSelectKCriterion={addSelectKCriterion}
                            onRemoveCriterion={removeCriterion}
                            onAddSelectKItem={addSelectKItem}
                            onRemoveSelectKItem={removeSelectKItem}
                            commit={commit}
                        />
                    );
                })()}
            </Card>

            <Card
                title="Explanation"
                open={open.explanation}
                onToggle={() => setOpen((s) => ({...s, explanation: !s.explanation}))}
            >
                {(() => {
                    const secIdx = sectionIndexById.get("explanation");
                    if (secIdx === undefined) return null;
                    return (
                        <RubricSectionEditor
                            secId="explanation"
                            local={local}
                            secIdx={secIdx}
                            sectionIndexById={sectionIndexById}
                            openBlocks={openBlocks}
                            setOpenBlocks={setOpenBlocks}
                            openItems={openItems}
                            setOpenItems={setOpenItems}
                            openChoices={openChoices}
                            setOpenChoices={setOpenChoices}
                            ensureCritRowIds={ensureCritRowIds}
                            ensureChoiceRowIds={ensureChoiceRowIds}
                            critRowIdsRef={critRowIdsRef}
                            choiceRowIdsRef={choiceRowIdsRef}
                            showInvalid={showInvalid}
                            markTouched={markTouched}
                            onCommitSectionTitle={(idx, v) => {
                                const next = structuredClone(local);
                                next.sections[idx].title = v;
                                commit(next);
                            }}
                            onAddBlock={addBlock}
                            onRemoveBlock={removeBlock}
                            onAddBinaryCriterion={addBinaryCriterion}
                            onAddSelectKCriterion={addSelectKCriterion}
                            onRemoveCriterion={removeCriterion}
                            onAddSelectKItem={addSelectKItem}
                            onRemoveSelectKItem={removeSelectKItem}
                            commit={commit}
                        />
                    );
                })()}
            </Card>

            <Card
                title="Plan/Recommendation"
                open={open.plan_recommendation}
                onToggle={() => setOpen((s) => ({...s, plan_recommendation: !s.plan_recommendation}))}
            >
                {(() => {
                    const secIdx = sectionIndexById.get("plan_recommendation");
                    if (secIdx === undefined) return null;
                    return (
                        <RubricSectionEditor
                            secId="plan_recommendation"
                            local={local}
                            secIdx={secIdx}
                            sectionIndexById={sectionIndexById}
                            openBlocks={openBlocks}
                            setOpenBlocks={setOpenBlocks}
                            openItems={openItems}
                            setOpenItems={setOpenItems}
                            openChoices={openChoices}
                            setOpenChoices={setOpenChoices}
                            ensureCritRowIds={ensureCritRowIds}
                            ensureChoiceRowIds={ensureChoiceRowIds}
                            critRowIdsRef={critRowIdsRef}
                            choiceRowIdsRef={choiceRowIdsRef}
                            showInvalid={showInvalid}
                            markTouched={markTouched}
                            onCommitSectionTitle={(idx, v) => {
                                const next = structuredClone(local);
                                next.sections[idx].title = v;
                                commit(next);
                            }}
                            onAddBlock={addBlock}
                            onRemoveBlock={removeBlock}
                            onAddBinaryCriterion={addBinaryCriterion}
                            onAddSelectKCriterion={addSelectKCriterion}
                            onRemoveCriterion={removeCriterion}
                            onAddSelectKItem={addSelectKItem}
                            onRemoveSelectKItem={removeSelectKItem}
                            commit={commit}
                        />
                    );
                })()}
            </Card>

            <Card
                title="Monitoring"
                open={open.monitoring}
                onToggle={() => setOpen((s) => ({...s, monitoring: !s.monitoring}))}
            >
                {(() => {
                    const secIdx = sectionIndexById.get("monitoring");
                    if (secIdx === undefined) return null;
                    return (
                        <RubricSectionEditor
                            secId="monitoring"
                            local={local}
                            secIdx={secIdx}
                            sectionIndexById={sectionIndexById}
                            openBlocks={openBlocks}
                            setOpenBlocks={setOpenBlocks}
                            openItems={openItems}
                            setOpenItems={setOpenItems}
                            openChoices={openChoices}
                            setOpenChoices={setOpenChoices}
                            ensureCritRowIds={ensureCritRowIds}
                            ensureChoiceRowIds={ensureChoiceRowIds}
                            critRowIdsRef={critRowIdsRef}
                            choiceRowIdsRef={choiceRowIdsRef}
                            showInvalid={showInvalid}
                            markTouched={markTouched}
                            onCommitSectionTitle={(idx, v) => {
                                const next = structuredClone(local);
                                next.sections[idx].title = v;
                                commit(next);
                            }}
                            onAddBlock={addBlock}
                            onRemoveBlock={removeBlock}
                            onAddBinaryCriterion={addBinaryCriterion}
                            onAddSelectKCriterion={addSelectKCriterion}
                            onRemoveCriterion={removeCriterion}
                            onAddSelectKItem={addSelectKItem}
                            onRemoveSelectKItem={removeSelectKItem}
                            commit={commit}
                        />
                    );
                })()}
            </Card>

            <Card
                title="Non-Scored Clinical Notes"
                open={open.non_scored}
                onToggle={() => setOpen((s) => ({...s, non_scored: !s.non_scored}))}
            >
                <NonScoredClinicalNotesPanel
                    nonScoredTip={nonScoredTip}
                    notes={local.nonScoredClinicalNotes}
                    rowIds={nonScoredRowIdsRef.current}
                    addNote={addNonScoredNote}
                    removeNote={removeNonScoredNote}
                    onChangeNote={(idx, v) => {
                        const next = structuredClone(local);
                        next.nonScoredClinicalNotes[idx] = v;
                        commit(next);
                    }}
                />
            </Card>
        </div>
    );
}
