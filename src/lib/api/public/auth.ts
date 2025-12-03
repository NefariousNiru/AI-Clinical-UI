// file: src/lib/api/public/auth.ts

import { http } from "../http";
import { AUTH_LOGIN, AUTH_LOGOUT } from "../../constants/urls";
import {
  LoginRequest as LoginRequestSchema,
  type LoginRequest,
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


