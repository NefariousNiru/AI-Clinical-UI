// file: src/lib/types/rubricSchema.ts

import {z} from "zod";

const NonEmpty = z.string().trim().min(1);

const RubricContraindicationsPolicySchema = z.literal("non_scored_feedback_only");

export const RubricStatusSchema = z.enum(["testing", "completed"]);
export type RubricStatus = z.infer<typeof RubricStatusSchema>;

const UnitEquivalentsSchema = z
    .record(z.string(), z.record(z.string(), z.number()))
    .superRefine((val: Record<string, Record<string, number>>, ctx) => {
        for (const [unit, inner] of Object.entries(val)) {
            if (typeof inner !== "object" || inner === null) {
                ctx.addIssue({
                    code: "custom",
                    message: `unitEquivalents["${unit}"] must be an object`,
                });
                return;
            }
            for (const k of Object.keys(inner)) {
                if (!/^-?\d+(\.\d+)?$/.test(k)) {
                    ctx.addIssue({
                        code: "custom",
                        message: `unitEquivalents inner key must be numeric-like, got "${k}"`,
                    });
                    return;
                }
            }
        }
    });

const SelectKItemSchema = z
    .object({
        key: NonEmpty,
        verbiage: NonEmpty,
        notes: z.string().optional().nullable(),
        aliases: z.unknown().optional().nullable(),
    })
    .strict();

const BinaryCriterionSchema = z
    .object({
        type: z.literal("binary"),
        key: NonEmpty,
        verbiage: NonEmpty,
        weight: z.number(),
        unitEquivalents: z.array(UnitEquivalentsSchema).optional().nullable(),
        notes: z.string().optional().nullable(),
        aliases: z.unknown().optional().nullable(),
    })
    .strict();

const SelectKCriterionSchema = z
    .object({
        type: z.literal("select_k"),
        groupId: NonEmpty,
        verbiage: NonEmpty,
        selectK: z.number().int().positive(),
        awardPoints: z.number(),
        items: z.array(SelectKItemSchema).min(1),
        dependsOnAny: z.array(NonEmpty).optional().nullable(),
        minItemsRequired: z.number().int().nonnegative().optional().nullable(),
        unitEquivalents: z.array(UnitEquivalentsSchema).optional().nullable(),
        notes: z.string().optional().nullable(),
    })
    .strict();

const CriterionSchema = z.discriminatedUnion("type", [
    BinaryCriterionSchema,
    SelectKCriterionSchema,
]);

const BlockSchema = z
    .object({
        id: NonEmpty,
        title: NonEmpty,
        maxPoints: z.number(),
        criteria: z.array(CriterionSchema),
        notes: z.string().optional().nullable(),
    })
    .strict();

const BaseSectionSchema = z
    .object({
        id: NonEmpty,
        title: NonEmpty,
        maxPoints: z.number(),
        blocks: z.array(BlockSchema).min(1),
    })
    .strict();

const IdentificationSectionSchema = BaseSectionSchema.extend({
    id: z.literal("identification"),
}).superRefine((sec, ctx) => {
    const hasPriority = sec.blocks.some((b) => b.id === "priority");
    if (!hasPriority) {
        ctx.addIssue({
            code: "custom",
            path: ["blocks"],
            message: 'identification section must include a block with id="priority"',
        });
    }
});

const ExplanationSectionSchema = BaseSectionSchema.extend({
    id: z.literal("explanation"),
});
const PlanRecommendationSectionSchema = BaseSectionSchema.extend({
    id: z.literal("plan_recommendation"),
});
const MonitoringSectionSchema = BaseSectionSchema.extend({
    id: z.literal("monitoring"),
});

const ScoringInvariantsSchema = z
    .object({
        requireSectionBlockSumsMatch: z.boolean(),
        evidenceScope: z.literal("section"),
        notes: z.string().optional().nullable(),
    })
    .strict();

export const RubricJsonSchema = z
    .object({
        rubricId: NonEmpty,
        rubricVersion: NonEmpty,
        schemaVersion: NonEmpty,

        scoringInvariants: ScoringInvariantsSchema,
        contraindicationsPolicy: RubricContraindicationsPolicySchema,
        evidenceKeys: z.array(NonEmpty),

        sections: z
            .tuple([
                IdentificationSectionSchema,
                ExplanationSectionSchema,
                PlanRecommendationSectionSchema,
                MonitoringSectionSchema,
            ])
            .superRefine((secs, ctx) => {
                const expected = [
                    "identification",
                    "explanation",
                    "plan_recommendation",
                    "monitoring",
                ] as const;

                for (let i = 0; i < expected.length; i++) {
                    if (secs[i].id !== expected[i]) {
                        ctx.addIssue({
                            code: "custom",
                            path: ["sections", i, "id"],
                            message: `sections[${i}].id must be "${expected[i]}"`,
                        });
                    }
                }
            }),

        nonScoredClinicalNotes: z.array(z.string()).optional(),

        // Stored in file JSON as well
        // (your backend includes it in the payload)
        // Keep strict contract: require it.
        // If you ever make it optional server-side, update here too.
        // For now: required.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // Note: Zod handles literal above.
    })
    .extend({
        nonScoredClinicalNotes: z.array(z.string()).optional(),
    })
    .strict();

export type RubricJson = z.infer<typeof RubricJsonSchema>;
