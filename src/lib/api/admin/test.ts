// file: src/lib/api/admin/test.ts

import { http } from "../http";
import { ADMIN_TEST_CHAT, ADMIN_TEST_POPULATE_UI, ADMIN_TEST_SUBMISSION, } from "../../constants/urls";
import type { PopulateUI, TestChatRequest, TestChatResponse, TestSubmissionResponse, } from "../../types/test.ts";
import {
	PopulateUISchema,
	TestChatRequestSchema,
	TestChatResponseSchema,
	TestSubmissionResponseSchema,
} from "../../types/test.ts";

/**
 * GET /api/v1/admin/test/populate_ui
 * Returns initial system prompt + available model names.
 *
 * Python: populate_test_ui() -> PopulateUI
 */
export async function fetchTestUiConfig(): Promise<PopulateUI> {
	const raw = await http.get<unknown>(ADMIN_TEST_POPULATE_UI);
	return PopulateUISchema.parse(raw);
}

/**
 * GET /api/v1/admin/test/submission?page=...&limit=...
 * Paged list of synthetic test submissions.
 *
 * Python: get_submission(...) -> TestSubmissionResponse
 */
export async function listStudentSubmissions(
	page: number,
	limit: number,
): Promise<TestSubmissionResponse> {
	const qs = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	}).toString();

	const raw = await http.get<unknown>(`${ADMIN_TEST_SUBMISSION}?${qs}`);
	return TestSubmissionResponseSchema.parse(raw);
}

/**
 * POST /api/v1/admin/test/chat
 * Grades a single synthetic submission with the given prompt + model.
 *
 * Python: chat(chat_request: TestChatRequest, ...) -> TestChatResponse
 */
export async function chat(payload: TestChatRequest): Promise<TestChatResponse> {
	const body = TestChatRequestSchema.parse(payload);
	const raw = await http.post<unknown>(ADMIN_TEST_CHAT, body);
	return TestChatResponseSchema.parse(raw);
}
