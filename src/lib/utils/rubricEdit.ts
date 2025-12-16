// file: src/lib/utils/rubricEdit.ts

import type {RubricJson} from "../types/rubricSchema";

/**
 * isValidSnakeKey
 *
 * Applies to user-entered values (not JSON keys):
 * - evidenceKeys entries
 * - criterion.key
 * - select_k.groupId
 * - select_k.items[].key
 */
export function isValidSnakeKey(s: string): boolean {
    if (!s) return false;
    return /^[a-z][a-z0-9_]*$/.test(s) && !s.endsWith("_");
}

function clampNumber(n: number, fallback = 0): number {
    return Number.isFinite(n) ? n : fallback;
}

function clampNonNegative(n: number): number {
    const x = clampNumber(n, 0);
    return x < 0 ? 0 : x;
}

export type RuleIssue = { path: string; message: string };

/**
 * recomputeDerivedPoints
 *
 * Editor-owned totals:
 * - block.maxPoints = sum(criteria points)
 * - section.maxPoints = sum(block.maxPoints)
 *
 * Scoring:
 * - binary contributes weight
 * - select_k contributes awardPoints
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

        sec.maxPoints = sec.blocks.reduce(
            (sum, b) => sum + clampNonNegative(b.maxPoints),
            0,
        );
    }

    return next;
}

/**
 * validateBusinessRules
 *
 * Business rules beyond schema:
 * - required blocks
 * - key format + uniqueness (values)
 * - non-negative points
 * - select-k constraints
 *
 * Note:
 * - Do not validate maxPoints consistency. The editor recomputes them.
 */
export function validateBusinessRules(draft: RubricJson): RuleIssue[] {
    const issues: RuleIssue[] = [];

    // 1) Required block: identification must contain "priority"
    const ident = draft.sections.find((s) => s.id === "identification");
    if (!ident || !ident.blocks.some((b) => b.id === "priority")) {
        issues.push({
            path: "sections.identification.blocks",
            message: 'Identification must include a block with id="priority".',
        });
    }

    // 2) evidenceKeys: value style + uniqueness
    const seenEvidence = new Set<string>();
    for (let i = 0; i < draft.evidenceKeys.length; i++) {
        const raw = draft.evidenceKeys[i];
        const k = (raw ?? "").trim();

        if (!isValidSnakeKey(k)) {
            issues.push({
                path: `evidenceKeys[${i}]`,
                message: `Invalid key "${k}". Use snake_case like onset_lt_36hr.`,
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

    // 3) Criteria: key rules + non-negative points + select-k constraints
    draft.sections.forEach((sec, sIdx) => {
        sec.blocks.forEach((b, bIdx) => {
            b.criteria.forEach((c, cIdx) => {
                const basePath = `sections[${sIdx}].blocks[${bIdx}].criteria[${cIdx}]`;

                if (c.type === "binary") {
                    if (!isValidSnakeKey(c.key)) {
                        issues.push({
                            path: `${basePath}.key`,
                            message: `Invalid key "${c.key}". Use snake_case.`,
                        });
                    }

                    if (!Number.isFinite(c.weight) || c.weight < 0) {
                        issues.push({
                            path: `${basePath}.weight`,
                            message: "Points must be a non-negative number.",
                        });
                    }
                    return;
                }

                // select_k
                if (!isValidSnakeKey(c.groupId)) {
                    issues.push({
                        path: `${basePath}.groupId`,
                        message: `Invalid group key "${c.groupId}". Use snake_case.`,
                    });
                }

                if (!Number.isFinite(c.selectK) || c.selectK < 1) {
                    issues.push({
                        path: `${basePath}.selectK`,
                        message: "Pick how many must be at least 1.",
                    });
                }

                if (!Number.isFinite(c.awardPoints) || c.awardPoints < 0) {
                    issues.push({
                        path: `${basePath}.awardPoints`,
                        message: "Points must be a non-negative number.",
                    });
                }

                if (!Array.isArray(c.items) || c.items.length < 1) {
                    issues.push({
                        path: `${basePath}.items`,
                        message: "At least one choice is required.",
                    });
                    return;
                }

                if (Number.isFinite(c.selectK) && c.selectK > c.items.length) {
                    issues.push({
                        path: `${basePath}.selectK`,
                        message: `Pick how many cannot be more than the number of choices (${c.items.length}).`,
                    });
                }

                const seenItemKeys = new Set<string>();
                c.items.forEach((it, itIdx) => {
                    const itPath = `${basePath}.items[${itIdx}]`;
                    const key = (it.key ?? "").trim();
                    const ver = (it.verbiage ?? "").trim();

                    if (!isValidSnakeKey(key)) {
                        issues.push({
                            path: `${itPath}.key`,
                            message: `Invalid key "${key}". Use snake_case.`,
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

/**
 * canonicalizeAndValidate
 *
 * - recompute totals
 * - run business rules
 */
export function canonicalizeAndValidate(
    draft: RubricJson,
): { draft: RubricJson; issues: RuleIssue[] } {
    const canonical = recomputeDerivedPoints(draft);
    const issues = validateBusinessRules(canonical);
    return {draft: canonical, issues};
}


export function newId(prefix: string): string {
    const rand = Math.random().toString(16).slice(2, 8);
    return `${prefix}_${Date.now().toString(36)}_${rand}`;
}
