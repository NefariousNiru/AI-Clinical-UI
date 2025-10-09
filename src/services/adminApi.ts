// src/services/adminApi.ts
import { http } from "../lib/http"
import { ADMIN_SYSTEM_PROMPT, ADMIN_SUBMISSION, ADMIN_CHAT, ADMIN_AVAILABLE_MODELS, ADMIN_AVAILABLE_RUBRICS, ADMIN_RUBRIC } from "../lib/urls"
import {
    SystemPromptResponse,
    StudentSubmissionResponse,
    ProblemFeedbackList,
    type ChatRequest,
} from "../types/admin"
import type { RubricPayload } from "../types/rubric"


// GET /api/v1/admin/system_prompt -> { systemPrompt: string }
export async function getSystemPrompt() {
    const data = await http.get<SystemPromptResponse>(ADMIN_SYSTEM_PROMPT)
    return data
}


// GET /api/v1/admin/submission?page=&limit= -> StudentSubmissionResponse
export async function getSubmissions(params: { page: number; limit: number }) {
    const qs = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit)
    }).toString()
    const data = await http.get<StudentSubmissionResponse>(`${ADMIN_SUBMISSION}?${qs}`)
    return data
}


// POST /api/v1/admin/chat -> List[ProblemFeedback]
export async function chat(req: ChatRequest) {
    const data = await http.post<ProblemFeedbackList>(ADMIN_CHAT, req)
    return data
}


// GET /api/v1/admin/list/models -> string[]
export async function getAvailableModels() {
    return http.get<string[]>(ADMIN_AVAILABLE_MODELS)
}


// GET /api/v1/admin/list/rubrics -> string[] (rubric ids like "gout_flare")
export async function getAvailableRubrics() {
    return http.get<string[]>(ADMIN_AVAILABLE_RUBRICS)
}


// GET /api/v1/admin/rubric?problem=<rubricId> -> RubricPayload
export async function getRubric(rubricId: string) {
    const qs = new URLSearchParams({ rubric_id: rubricId }).toString()
    return http.get<RubricPayload>(`${ADMIN_RUBRIC}?${qs}`)
}