// src/routes/auth/LoginPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, me } from "../../services/authApi";
import { LoginRequest, type MeResponse } from "../../types/auth";
import { ZodError } from "zod";
import Header from "../../components/Header";

type LocationState = { from?: string };
type FieldErrors = { email?: string; password?: string; form?: string };

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: LocationState };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // already signed-in? route by role
  useEffect(() => {
    let alive = true;
    me()
      .then((u: MeResponse) => {
        if (!alive) return;
        nav(u.role === "admin" ? "/admin" : "/student", { replace: true });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [nav]);

  function clearFieldError(field: keyof FieldErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // 1) Client-side validation (no network)
      const parsed = LoginRequest.safeParse({ email, password });
      if (!parsed.success) {
        const fieldErrs: FieldErrors = {};
        for (const issue of parsed.error.issues) {
          const p = issue.path[0];
          if (p === "email" || p === "password") fieldErrs[p] = issue.message;
        }
        setErrors(fieldErrs);
        return;
      }

      // 2) Network: login then fetch role
      await login(parsed.data); // should throw on non-2xx
      const u = await me();
      const dest =
        loc.state?.from || (u.role === "admin" ? "/admin" : "/student");
      nav(dest, { replace: true });
    } catch (err: unknown) {
      setErrors({ form: await normalizeAuthError(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header title="AI Clinical Login" />
      <main className="px-4 py-10 grid place-items-center">
        <form
          onSubmit={onSubmit}
          noValidate
          className="w-[min(440px,95vw)] rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-5 py-3 text-base font-semibold">
            Sign in
          </div>

          <div className="p-5 space-y-4">
            {/* form-level error (auth/server) */}
            {errors.form && (
              <div className="rounded-md border border-orange-300 bg-orange-100 px-3 py-2 text-sm text-orange-800">
                {errors.form}
              </div>
            )}

            {/* email */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-gray-600">
                UGA Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) clearFieldError("email");
                }}
                className={`w-full rounded-md border bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-300 ${
                  errors.email ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="netid@uga.edu"
                autoFocus
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-gray-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) clearFieldError("password");
                }}
                className={`w-full rounded-md border bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-300 ${
                  errors.password ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                required
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-gray-900 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="text-[11px] text-gray-500">
              Use your assigned credentials. This site uses session cookies;
              signing in implies consent to store a session on this device.
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

/* ---------- Strict helpers (no any) ---------- */

async function normalizeAuthError(err: unknown): Promise<string> {
  if (err instanceof ZodError) {
    return err.issues[0]?.message ?? "Invalid input.";
  }

  const res = extractResponse(err);
  if (res) {
    // Prefer API-provided message
    const data = await tryParseJson(res.clone());
    if (data?.message) return data.message;
    if (data?.error) return data.error;

    // Status-based fallbacks
    if (res.status === 401) return "Incorrect email or password.";
    if (res.status === 403) return "You do not have access to this resource.";
    if (res.status === 429) return "Too many attempts. Try again later.";
    if (res.status >= 500) return "Server error. Please try again shortly.";
    return `Request failed with status ${res.status}.`;
  }

  const msg = extractMessage(err);
  return msg ?? "Login failed.";
}

function extractResponse(e: unknown): Response | null {
  if (e instanceof Response) return e;
  if (typeof e === "object" && e !== null) {
    const rec = e as Record<string, unknown>;
    const maybe = rec["response"];
    return maybe instanceof Response ? maybe : null;
  }
  return null;
}

async function tryParseJson(
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

function extractMessage(e: unknown): string | null {
  if (e instanceof Error && typeof e.message === "string" && e.message.trim())
    return e.message;
  if (typeof e === "object" && e !== null) {
    const rec = e as Record<string, unknown>;
    const msg = rec["message"];
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return null;
}
