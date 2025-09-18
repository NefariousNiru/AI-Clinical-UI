// src/types/admin.ts
import { z } from "zod"

/** enums */
export const ProblemName = z.enum(["gout_flare", "obesity"])
export type ProblemName = z.infer<typeof ProblemName>


/** DrugRelatedProblem (camelCase) */
export const DrugRelatedProblem = z.object({
    name: ProblemName,
    isPriority: z.boolean().default(false),
    identification: z.string().default(""),
    explanation: z.string().default(""),
    planRecommendation: z.string().default(""),
    monitoring: z.string().default("")
})
export type DrugRelatedProblem = z.infer<typeof DrugRelatedProblem>


/** StudentSubmission */
export const StudentSubmission = z.object({
    id: z.number().int(),
    synthetic: z.boolean(),
    problems: z.array(DrugRelatedProblem)
})
export type StudentSubmission = z.infer<typeof StudentSubmission>


/** Paginated response */
export const StudentSubmissionResponse = z.object({
    items: z.array(StudentSubmission),
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    pages: z.number().int()
})
export type StudentSubmissionResponse = z.infer<typeof StudentSubmissionResponse>


/** System prompt response */
export const SystemPromptResponse = z.object({
    systemPrompt: z.string()
})
export type SystemPromptResponse = z.infer<typeof SystemPromptResponse>


/** FeedbackSection */
export const FeedbackSection = z.object({
    score: z.string().default(""),
    evaluation: z.string().default(""),
    feedback: z.string().default("")
})
export type FeedbackSection = z.infer<typeof FeedbackSection>


/** ProblemFeedback (camelCase, matches API) */
export const ProblemFeedback = z.object({
    name: ProblemName,
    isPriority: z.boolean().default(false),
    identification: FeedbackSection,
    explanation: FeedbackSection,
    planRecommendation: FeedbackSection,
    monitoring: FeedbackSection
})
export type ProblemFeedback = z.infer<typeof ProblemFeedback>


/** List[ProblemFeedback] */
export const ProblemFeedbackList = z.array(ProblemFeedback)
export type ProblemFeedbackList = z.infer<typeof ProblemFeedbackList>


/** ChatRequest */
export type ChatRequest = {
    // camelCase to match your “everything goes out in camel case” rule
    studentSubmission: StudentSubmission
    systemPrompt: string
    modelName: string
}


/** Parse helper */
export const parseProblemFeedbackList = (d: unknown) => ProblemFeedbackList.parse(d)
export const parseStudentSubmissionResponse = (d: unknown) =>
    StudentSubmissionResponse.parse(d)
export const parseSystemPromptResponse = (d: unknown) =>
    SystemPromptResponse.parse(d)
