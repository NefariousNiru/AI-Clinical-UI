// src/services/adminApi.ts
import { http } from "../lib/http"
import { ADMIN_SYSTEM_PROMPT, ADMIN_SUBMISSION, ADMIN_CHAT } from "../lib/urls"
import {
    SystemPromptResponse,
    StudentSubmissionResponse,
    ProblemFeedbackList,
    type ChatRequest,
} from "../types/admin"


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
