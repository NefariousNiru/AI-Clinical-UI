// file: src/lib/utils/rubricEdit.ts


import type {RubricDraft} from "../../pages/admin/hooks/rubric.ts";


/**
 * Basic rubric key style guidance:
 * - snake_case
 * - lowercase
 * - no spaces
 */
export function isValidSnakeKey(s: string): boolean {
    if (!s) return false;
    return /^[a-z][a-z0-9_]*$/.test(s) && !s.endsWith("_");
}

export function clampNumber(n: number, fallback = 0): number {
    return Number.isFinite(n) ? n : fallback;
}

export function newId(prefix: string): string {
    const rand = Math.random().toString(16).slice(2, 8);
    return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/**
 * Computes derived maxPoints for blocks and sections.
 * Rules:
 * - binary criterion contributes `weight`
 * - select_k criterion contributes `awardPoints`
 */
export function recomputeDerivedPoints(draft: RubricDraft): RubricDraft {
    const next = structuredClone(draft);

    for (const sec of next.sections) {
        for (const b of sec.blocks) {
            let blockMax = 0;

            for (const c of b.criteria) {
                if (c.type === "binary") blockMax += clampNumber(c.weight, 0);
                else blockMax += clampNumber(c.awardPoints, 0);
            }

            b.maxPoints = blockMax;
        }

        sec.maxPoints = sec.blocks.reduce((sum, b) => sum + clampNumber(b.maxPoints, 0), 0);
    }

    return next;
}

export type RuleIssue = { path: string; message: string };

/**
 * Business-rule validation (beyond Zod).
 * Use this in the hook so BOTH formatted and JSON edits get the same checks.
 */
export function validateBusinessRules(draft: RubricDraft): RuleIssue[] {
    const issues: RuleIssue[] = [];

    // required block: identification must contain "priority"
    const ident = draft.sections.find((s) => s.id === "identification");
    if (!ident || !ident.blocks.some((b) => b.id === "priority")) {
        issues.push({
            path: "sections.identification.blocks",
            message: 'identification must include a block with id="priority"',
        });
    }

    // evidenceKeys: enforce key style
    for (let i = 0; i < draft.evidenceKeys.length; i++) {
        const k = draft.evidenceKeys[i] ?? "";
        if (!isValidSnakeKey(k)) {
            issues.push({
                path: `evidenceKeys[${i}]`,
                message: `invalid key "${k}". Use snake_case like onset_hours_less_than_36`,
            });
        }
    }

    // criterion keys
    draft.sections.forEach((sec, sIdx) => {
        sec.blocks.forEach((b, bIdx) => {
            b.criteria.forEach((c, cIdx) => {
                if (c.type === "binary") {
                    if (!isValidSnakeKey(c.key)) {
                        issues.push({
                            path: `sections[${sIdx}].blocks[${bIdx}].criteria[${cIdx}].key`,
                            message: `invalid key "${c.key}". Use snake_case`,
                        });
                    }
                } else {
                    if (!isValidSnakeKey(c.groupId)) {
                        issues.push({
                            path: `sections[${sIdx}].blocks[${bIdx}].criteria[${cIdx}].groupId`,
                            message: `invalid groupId "${c.groupId}". Use snake_case`,
                        });
                    }
                    c.items.forEach((it, itIdx) => {
                        if (!isValidSnakeKey(it.key)) {
                            issues.push({
                                path: `sections[${sIdx}].blocks[${bIdx}].criteria[${cIdx}].items[${itIdx}].key`,
                                message: `invalid item key "${it.key}". Use snake_case`,
                            });
                        }
                    });
                }
            });
        });
    });

    // points add up checks (derived must match)
    const computed = recomputeDerivedPoints(draft);

    computed.sections.forEach((sec, sIdx) => {
        const origSec = draft.sections[sIdx];
        if (origSec.maxPoints !== sec.maxPoints) {
            issues.push({
                path: `sections[${sIdx}].maxPoints`,
                message: `maxPoints must equal sum(block.maxPoints). Expected ${sec.maxPoints}, got ${origSec.maxPoints}`,
            });
        }

        sec.blocks.forEach((b, bIdx) => {
            const origB = origSec.blocks[bIdx];
            if (origB.maxPoints !== b.maxPoints) {
                issues.push({
                    path: `sections[${sIdx}].blocks[${bIdx}].maxPoints`,
                    message: `maxPoints must equal sum(criteria points). Expected ${b.maxPoints}, got ${origB.maxPoints}`,
                });
            }
        });
    });

    return issues;
}
