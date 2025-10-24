// src/lib/errors.ts
/*
1) Purpose: Centralize user-facing error normalization for HTTP + validation.
2) Usage: UI forms call `normalizeAuthError(err)` to convert unknown errors into clean text.
3) Behavior: Prefer server JSON `message|detail|error`, then status-based fallbacks, then generic.
*/
import { ZodError } from "zod";

export async function normalizeAuthError(err: unknown): Promise<string> {
    if (err instanceof ZodError) {
        return err.issues[0]?.message ?? "Invalid input.";
    }

    const res = extractResponse(err);
    if (res) {
        const data = await tryParseJson(res.clone());
        if (data?.message) return data.message;
        if (data?.error) return data.error;

        if (res.status === 401) return "Incorrect email or password.";
        if (res.status === 403) return "You do not have access to this resource.";
        if (res.status === 429) return "Too many attempts. Try again later.";
        if (res.status >= 500) return "Server error. Please try again shortly.";
        return `Request failed with status ${res.status}.`;
    }

    const msg = extractMessage(err);
    return msg ?? "Login failed.";
}

/* 4) Helpers: leniently pull a Response, parse JSON, or read a message string */
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
    res: Response
): Promise<{ message?: string; error?: string } | null> {
    try {
        const parsed = (await res.json()) as unknown;
        if (typeof parsed === "object" && parsed !== null) {
            const rec = parsed as Record<string, unknown>;
            const message =
                typeof rec["message"] === "string" ? rec["message"] : undefined;
            const error = typeof rec["error"] === "string" ? rec["error"] : undefined;
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
