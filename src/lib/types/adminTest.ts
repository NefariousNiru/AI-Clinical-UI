// file: src/lib/types/adminTest.ts

import { z } from "zod";
import { ProblemFeedbackSchema, DrugRelatedProblemSchema } from "./feedback";

/**
 * PopulateUI payload.
 *
 * Mirrors Python:
 *   class PopulateUI(Model):
 *       system_prompt: str
 *       model_names: list[ModelName]
 *
 * Frontend: `ModelName` is represented as `string`.
 */
export const PopulateUISchema = z.object({
    systemPrompt: z.string(),
    modelNames: z.array(z.string()),
});

export type PopulateUI = z.infer<typeof PopulateUISchema>;

/**
 * TestSubmission payload.
 *
 * Mirrors Python:
 *   class TestSubmission(Model):
 *       id: int
 *       tags: list[str]
 *       problems: list[DrugRelatedProblem]
 */
export const TestSubmissionSchema = z.object({
    id: z.number().int(),
    tags: z.array(z.string()),
    problems: z.array(DrugRelatedProblemSchema),
});

export type TestSubmission = z.infer<typeof TestSubmissionSchema>;

/**
 * Paginated response for test submissions.
 *
 * Mirrors Python:
 *   class TestSubmissionResponse(Model):
 *       items: list[TestSubmission]
 *       page: int
 *       limit: int
 *       total: int
 *       pages: int
 */
export const TestSubmissionResponseSchema = z.object({
    items: z.array(TestSubmissionSchema),
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    pages: z.number().int(),
});

export type TestSubmissionResponse = z.infer<typeof TestSubmissionResponseSchema>;

/**
 * TestChatRequest payload.
 *
 * Mirrors Python:
 *   class TestChatRequest(Model):
 *       test_submission: TestSubmission
 *       system_prompt: str
 *       model_name: ModelName
 *
 * CamelCase mapping:
 *   test_submission -> testSubmission
 *   system_prompt   -> systemPrompt
 *   model_name      -> modelName
 *
 * Frontend: `modelName` is a plain string.
 */
export const TestChatRequestSchema = z.object({
    testSubmission: TestSubmissionSchema,
    systemPrompt: z.string(),
    modelName: z.string(),
});

export type TestChatRequest = z.infer<typeof TestChatRequestSchema>;

/**
 * TestChatResponse payload.
 *
 * Mirrors Python:
 *   class TestChatResponse(Model):
 *       results: list[ProblemFeedback]
 */
export const TestChatResponseSchema = z.object({
    results: z.array(ProblemFeedbackSchema),
});

export type TestChatResponse = z.infer<typeof TestChatResponseSchema>;