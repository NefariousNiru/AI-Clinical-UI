// src/lib/urls.ts

// API versioned path
export const API_V1 = "/api/v1"


// ---------------------- user ----------------------
export const AUTH_LOGIN = `${API_V1}/auth/login`
export const AUTH_LOGOUT = `${API_V1}/auth/logout`
export const ME = `${API_V1}/me`


// ---------------------- admin ----------------------
export const ADMIN = `${API_V1}/admin`
export const ADMIN_SYSTEM_PROMPT = `${ADMIN}/system_prompt`
export const ADMIN_SUBMISSION = `${ADMIN}/submission`
export const ADMIN_CHAT = `${ADMIN}/chat`
export const ADMIN_AVAILABLE_MODELS = `${ADMIN}/list/models`
export const ADMIN_AVAILABLE_RUBRICS = `${ADMIN}/list/rubrics`
export const ADMIN_RUBRIC = `${ADMIN}/rubric`

// ---------------------- student --------------------