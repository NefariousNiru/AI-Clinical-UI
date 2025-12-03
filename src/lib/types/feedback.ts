// file: src/lib/types/feedback.ts

import { z } from "zod";

/**
 * Non-empty string with whitespace trimmed.
 * Matches Python `NonEmptyStr = constr(strip_whitespace=True, min_length=1)`.
 */
export const NonEmptyStringSchema = z.string().trim().min(1);

/**
 * FeedbackSection payload.
 *
 * Mirrors Python:
 *   class FeedbackSection(Model):
 *       score: NonEmptyStr
 *       evaluation: NonEmptyStr
 *       feedback: NonEmptyStr
 */
export const FeedbackSectionSchema = z.object({
    score: NonEmptyStringSchema,
    evaluation: NonEmptyStringSchema,
    feedback: NonEmptyStringSchema,
});

export type FeedbackSection = z.infer<typeof FeedbackSectionSchema>;

/**
 * ProblemFeedback payload.
 *
 * Mirrors Python:
 *   class ProblemFeedback(Model):
 *       name: str
 *       is_priority: bool = False
 *       identification: FeedbackSection
 *       explanation: FeedbackSection
 *       plan_recommendation: FeedbackSection
 *       monitoring: FeedbackSection
 *
 * CamelCase mapping:
 *   is_priority          -> isPriority
 *   plan_recommendation  -> planRecommendation
 */
export const ProblemFeedbackSchema = z.object({
    name: z.string(),
    isPriority: z.boolean().default(false),
    identification: FeedbackSectionSchema,
    explanation: FeedbackSectionSchema,
    planRecommendation: FeedbackSectionSchema,
    monitoring: FeedbackSectionSchema,
});

export type ProblemFeedback = z.infer<typeof ProblemFeedbackSchema>;
export type ProblemFeedbackList = ProblemFeedback[];

/**
 * Problem as submitted by the student (DrugRelatedProblem).
 *
 * Mirrors Python:
 *   class DrugRelatedProblem(Model):
 *       name: str
 *       is_priority: bool = False
 *       identification: str = ""
 *       explanation: str = ""
 *       plan_recommendation: str = ""
 *       monitoring: str = ""
 *
 * CamelCase mapping:
 *   is_priority          -> isPriority
 *   plan_recommendation  -> planRecommendation
 */
export const DrugRelatedProblemSchema = z.object({
    name: z.string(),
    isPriority: z.boolean().default(false),
    identification: z.string().default(""),
    explanation: z.string().default(""),
    planRecommendation: z.string().default(""),
    monitoring: z.string().default(""),
});

export type DrugRelatedProblem = z.infer<typeof DrugRelatedProblemSchema>;

