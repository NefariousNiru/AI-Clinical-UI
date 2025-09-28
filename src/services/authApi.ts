// src/services/authApi.ts
import { http } from "../lib/http"
import { AUTH_LOGIN, AUTH_LOGOUT, ME } from "../lib/urls"
import { LoginRequest, MeResponse } from "../types/auth"

export async function login(body: LoginRequest) {
    const payload = LoginRequest.parse(body)
    return http.post<{ ok: true }>(AUTH_LOGIN, payload)
}

export async function logout() {
    return http.post<{ ok: true }>(AUTH_LOGOUT)
}

export async function me() {
    const raw = await http.get<unknown>(ME)
    return MeResponse.parse(raw)
}
