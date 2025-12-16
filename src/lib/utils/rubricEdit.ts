// file: src/lib/utils/rubricEdit.ts

import type {RubricJson, SelectKCriterion, BinaryCriterion} from "../types/rubricSchema";

export function isValidSnakeKey(s: string): boolean {
    if (!s) return false;
    return /^[a-z][a-z0-9_]*$/.test(s) && !s.endsWith("_");
}

export function clampNumber(n: number, fallback = 0): number {
    return Number.isFinite(n) ? n : fallback;
}

export function clampNonNegative(n: number): number {
    const x = clampNumber(n, 0);
    return x < 0 ? 0 : x;
}

export function newId(prefix: string): string {
    const rand = Math.random().toString(16).slice(2, 8);
    return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/**
 * Editor-owned totals:
 * - block.maxPoints = sum(criteria points)
 * - section.maxPoints = sum(block.maxPoints)
 */
export function recomputeDerivedPoints(draft: RubricJson): RubricJson {
    const next: RubricJson = structuredClone(draft);

    for (const sec of next.sections) {
        for (const b of sec.blocks) {
            let blockMax = 0;

            for (const c of b.criteria) {
                if (c.type === "binary") blockMax += clampNonNegative(c.weight);
                else blockMax += clampNonNegative(c.awardPoints);
            }

            b.maxPoints = blockMax;
        }

        sec.maxPoints = sec.blocks.reduce((sum, b) => sum + clampNonNegative(b.maxPoints), 0);
    }

    return next;
}

export type RuleIssue = { path: string; message: string };

export function validateBusinessRules(draft: RubricJson): RuleIssue[] {
    const issues: RuleIssue[] = [];

    const ident = draft.sections.find((s) => s.id === "identification");
    if (!ident || !ident.blocks.some((b) => b.id === "priority")) {
        issues.push({
            path: "sections.identification.blocks",
            message: 'Identification must include a block with id="priority".',
        });
    }

    const seenEvidence = new Set<string>();
    for (let i = 0; i < draft.evidenceKeys.length; i++) {
        const raw = draft.evidenceKeys[i];
        const k = (raw ?? "").trim();

        if (!isValidSnakeKey(k)) {
            issues.push({
                path: `evidenceKeys[${i}]`,
                message: `Invalid key "${k}". Use a key like onset_lt_36hr.`,
            });
        }

        if (k) {
            if (seenEvidence.has(k)) {
                issues.push({
                    path: `evidenceKeys[${i}]`,
                    message: `Duplicate evidence key "${k}". Evidence keys must be unique.`,
                });
            }
            seenEvidence.add(k);
        }
    }

    draft.sections.forEach((sec, sIdx) => {
        sec.blocks.forEach((b, bIdx) => {
            b.criteria.forEach((c, cIdx) => {
                const basePath = `sections[${sIdx}].blocks[${bIdx}].criteria[${cIdx}]`;

                if (c.type === "binary") {
                    const cc: BinaryCriterion = c;

                    if (!isValidSnakeKey(cc.key)) {
                        issues.push({
                            path: `${basePath}.key`,
                            message: `Invalid key "${cc.key}".`,
                        });
                    }

                    if (!Number.isFinite(cc.weight) || cc.weight < 0) {
                        issues.push({
                            path: `${basePath}.weight`,
                            message: "Points must be a non-negative number.",
                        });
                    }
                    return;
                }

                const sc: SelectKCriterion = c;

                if (!isValidSnakeKey(sc.groupId)) {
                    issues.push({
                        path: `${basePath}.groupId`,
                        message: `Invalid group key "${sc.groupId}".`,
                    });
                }

                if (!Number.isFinite(sc.selectK) || sc.selectK < 1) {
                    issues.push({
                        path: `${basePath}.selectK`,
                        message: "Pick how many must be at least 1.",
                    });
                }

                if (!Number.isFinite(sc.awardPoints) || sc.awardPoints < 0) {
                    issues.push({
                        path: `${basePath}.awardPoints`,
                        message: "Points must be a non-negative number.",
                    });
                }

                if (!Array.isArray(sc.items) || sc.items.length < 1) {
                    issues.push({
                        path: `${basePath}.items`,
                        message: "At least one choice is required.",
                    });
                    return;
                }

                if (Number.isFinite(sc.selectK) && sc.selectK > sc.items.length) {
                    issues.push({
                        path: `${basePath}.selectK`,
                        message: `Pick how many cannot be more than the number of choices (${sc.items.length}).`,
                    });
                }

                const seenItemKeys = new Set<string>();
                sc.items.forEach((it, itIdx) => {
                    const itPath = `${basePath}.items[${itIdx}]`;
                    const key = (it.key ?? "").trim();
                    const ver = (it.verbiage ?? "").trim();

                    if (!isValidSnakeKey(key)) {
                        issues.push({
                            path: `${itPath}.key`,
                            message: `Invalid key "${key}".`,
                        });
                    }

                    if (key) {
                        if (seenItemKeys.has(key)) {
                            issues.push({
                                path: `${itPath}.key`,
                                message: `Duplicate choice key "${key}". Choice keys must be unique within this item.`,
                            });
                        }
                        seenItemKeys.add(key);
                    }

                    if (!ver) {
                        issues.push({
                            path: `${itPath}.verbiage`,
                            message: "Choice text cannot be empty.",
                        });
                    }
                });
            });
        });
    });

    return issues;
}

export function canonicalizeAndValidate(
    draft: RubricJson,
): { draft: RubricJson; issues: RuleIssue[] } {
    const canonical = recomputeDerivedPoints(draft);
    const issues = validateBusinessRules(canonical);
    return {draft: canonical, issues};
}

