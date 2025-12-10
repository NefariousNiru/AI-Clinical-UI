// file: src/lib/api/public/auth.ts

import {http} from "../http";
import {AUTH_ACCOUNT_ACTIVATE, AUTH_LOGIN, AUTH_LOGOUT} from "../../constants/urls";
import {
    LoginRequest as LoginRequestSchema,
    type LoginRequest,
    UserActivationRequest as UserActivationRequestSchema,
    type UserActivationRequest,
} from "../../types/auth";

/**
 * POST /api/v1/public/auth/login
 *
 * Validates with zod on the client, then calls backend.
 * Returns `{ ok: true }` on success (shape per backend contract).
 */
export async function login(body: LoginRequest): Promise<{ ok: boolean }> {
    const payload = LoginRequestSchema.parse(body);
    return http.post<{ ok: boolean }>(AUTH_LOGIN, payload);
}

/**
 * POST /api/v1/public/auth/logout
 *
 * Invalidates the server-side session.
 */
export async function logout(): Promise<{ ok: boolean }> {
    return http.post<{ ok: boolean }>(AUTH_LOGOUT);
}


/**
 * POST /api/v1/public/auth/activate/account
 *
 * Activates a user account with `{ token, password }`.
 */
export async function activateAccount(
    body: UserActivationRequest,
): Promise<{ ok: boolean }> {
    const payload = UserActivationRequestSchema.parse(body);
    return http.post<{ ok: boolean }>(AUTH_ACCOUNT_ACTIVATE, payload);
}

