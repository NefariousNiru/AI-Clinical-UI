// src/types/rubric.ts
import { z } from "zod";

/** Shared literal enums to avoid open strings leaking in */
export const gradingStyleEnum = z.enum(["strict", "lenient"]);
export const contraindicationsEnum = z.enum([
    "non_scored_feedback_only",
    "scored_zero_section",
]);

/** Criteria */
const CriterionBinary = z.object({
    type: z.literal("binary"),
    key: z.string(),
    verbiage: z.string(),
    weight: z.number(),
    aliases: z.array(z.string()).optional(),
    unitEquivalents: z
        .array(z.record(z.string(), z.record(z.string(), z.number())))
        .optional(),
    // optional scope hints are allowed but not defaulted here
    evidenceScope: z.enum(["section", "global"]).optional(),
    allowedFields: z.array(z.string()).optional(),
});

const SelectKItem = z.object({
    key: z.string(),
    verbiage: z.string(),
    aliases: z.array(z.string()).optional(),
});

const CriterionSelectK = z.object({
    type: z.literal("select_k"),
    groupId: z.string(),
    verbiage: z.string(),
    selectK: z.number().int(),
    awardPoints: z.number(),
    minItemsRequired: z.number().int().nullable().optional(),
    dependsOnAny: z.array(z.string()).nullable().optional(),
    items: z.array(SelectKItem),
    evidenceScope: z.enum(["section", "global"]).optional(),
    allowedFields: z.array(z.string()).optional(),
});

export const Criterion = z.discriminatedUnion("type", [
    CriterionBinary,
    CriterionSelectK,
]);

/** Block, Section */
export const Block = z.object({
    id: z.string(),
    title: z.string(),
    maxPoints: z.number(),
    criteria: z.array(Criterion),
    notes: z.string().optional(),
});

export const Section = z.object({
    id: z.string(),
    title: z.string(),
    maxPoints: z.number(),
    blocks: z.array(Block),
});

/** Scoring invariants - no defaults, entirely optional fields */
export const ScoringInvariants = z.object({
    rounding: z.literal("0.5").optional(),
    requireSectionBlockSumsMatch: z.boolean().optional(),
    gradingStyle: gradingStyleEnum.optional(),
    evidenceScope: z.enum(["section", "global"]).nullable().optional(),
    notes: z.string().nullable().optional(),
});

/** Root payload */
export const RubricPayload = z.object({
    rubricId: z.string(),
    rubricVersion: z.string(),
    schemaVersion: z.string(),
    scoringInvariants: ScoringInvariants, // present, but its members are optional
    contraindicationsPolicy: contraindicationsEnum,
    evidenceKeys: z.array(z.string()).optional(),
    sections: z.array(Section),
    nonScoredClinicalNotes: z.array(z.string()).optional(),
});

export type RubricPayload = z.infer<typeof RubricPayload>;
export type Section = z.infer<typeof Section>;
export type Block = z.infer<typeof Block>;
export type Criterion = z.infer<typeof Criterion>;
export type CriterionBinary = z.infer<typeof CriterionBinary>;
export type CriterionSelectK = z.infer<typeof CriterionSelectK>;
export type SelectKItem = z.infer<typeof SelectKItem>;
export type ScoringInvariants = z.infer<typeof ScoringInvariants>;

