// file: src/lib/errors.ts

/*
1) Purpose: Centralize user-facing error normalization for HTTP + validation.
2) Usage: UI forms call `normalizeAuthError(err)` to convert unknown errors into clean text.
3) Behavior: Prefer server JSON `message|detail|error`, then status-based fallbacks, then generic.
*/

import { ZodError } from "zod";
import { ApiError } from "./http";

export async function normalizeAuthError(err: unknown): Promise<string> {
  // 1) Zod validation errors (client-side)
  if (err instanceof ZodError) {
    return err.issues[0]?.message ?? "Invalid input.";
  }

  // 2) HTTP / backend errors coming from our http client
  if (err instanceof ApiError) {
    const status = err.status ?? 0;
    const data = err.data;

    // Prefer server-provided message/detail/error if present
    if (isRecord(data)) {
      const message = pickField(data, ["message", "detail", "error"]);
      if (message) {
        return message;
      }
    }

    // Status-based fallbacks tuned for auth flows
    if (status === 401) return "Incorrect email or password.";
    if (status === 403) return "You do not have access to this resource.";
    if (status === 429) return "Too many attempts. Try again later.";
    if (status >= 500) return "Server error. Please try again shortly.";

    // If we got an ApiError but no structured payload, fall back to message
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message;
    }

    return `Request failed with status ${status || "unknown"}.`;
  }

  // 3) Fallback for any other error type
  const msg = extractMessage(err);
  return msg ?? "Login failed.";
}

/* 4) Helpers: leniently pull a Response, parse JSON, or read a message string
   These remain exported in case other parts of the app want to work with raw fetch errors.
*/
export function extractResponse(e: unknown): Response | null {
  if (e instanceof Response) return e;
  if (typeof e === "object" && e !== null) {
    const rec = e as Record<string, unknown>;
    const maybe = rec["response"];
    return maybe instanceof Response ? maybe : null;
  }
  return null;
}

export async function tryParseJson(
  res: Response,
): Promise<{ message?: string; error?: string } | null> {
  try {
    const parsed = (await res.json()) as unknown;
    if (typeof parsed === "object" && parsed !== null) {
      const rec = parsed as Record<string, unknown>;
      const message =
        typeof rec["message"] === "string" ? rec["message"] : undefined;
      const error =
        typeof rec["error"] === "string" ? rec["error"] : undefined;
      return { message, error };
    }
    return null;
  } catch {
    return null;
  }
}

export function extractMessage(e: unknown): string | null {
  if (e instanceof Error && typeof e.message === "string" && e.message.trim()) {
    return e.message;
  }
  if (typeof e === "object" && e !== null) {
    const rec = e as Record<string, unknown>;
    const msg = rec["message"];
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return null;
}

/* 5) Internal helpers */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickField(
  rec: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const k of keys) {
    const val = rec[k];
    if (typeof val === "string" && val.trim()) {
      return val;
    }
  }
  return null;
}
