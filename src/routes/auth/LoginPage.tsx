// src/routes/auth/LoginPage.tsx

/*
1) Page goals:
   - Validate inputs client-side with zod (no network).
   - Require consent checkbox before calling the API.
   - On success: fetch role and route user.
   - On failure: show normalized, human-readable errors.

2) UX rules:
   - Never rely on browser validations (we use noValidate).
   - Show field errors inline; show server/consent errors at top.
   - Keep "Sign in" disabled only while a request is in flight.

3) Security:
   - Cookie-based session; fetch includes credentials.
   - Optional CSRF header set in http client if cookie present.
*/

import { normalizeAuthError } from "../../lib/errors";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, me } from "../../services/authApi";
import { LoginRequest, type MeResponse } from "../../types/auth";
import Header from "../../components/Header";

type LocationState = { from?: string };
type FieldErrors = { email?: string; password?: string; form?: string };

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: LocationState };

  // 0) Controlled fields + UI state
  const [email, setEmail] = useState(""); // 0.1) controlled email
  const [password, setPassword] = useState(""); // 0.2) controlled password
  const [consent, setConsent] = useState(false); // 0.3) consent checkbox
  const [triedSubmit, setTriedSubmit] = useState(false); // 0.4) show consent hint only after a failed submit
  const [errors, setErrors] = useState<FieldErrors>({}); // 0.5) field + form errors
  const [loading, setLoading] = useState(false); // 0.6) submit spinner flag

  // 1) If already signed in, route by role
  useEffect(() => {
    let alive = true;
    me()
      .then((u: MeResponse) => {
        if (!alive) return;
        nav(u.role === "admin" ? "/admin" : "/student", { replace: true });
      })
      .catch(() => {}); // 1.1) ignore 401 on first load
    return () => {
      alive = false;
    };
  }, [nav]);

  // 2) Clear a single field error on change
  function clearFieldError(field: keyof FieldErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  }

  // 3) Submit flow: Zod -> consent gate -> network -> route or show normalized errors
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setTriedSubmit(true); // 3.0) from now on, we can show consent hint if missing
    setLoading(true);

    try {
      // 3.1) Zod validation (client-side, no network)
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

      // 3.2) Consent gate (custom - do not nag before a click)
      if (!consent) {
        setErrors({ form: "You must provide consent to continue." });
        return;
      }

      // 3.3) Network: login (should throw on non-2xx)
      await login(parsed.data);

      // 3.4) Fetch role and route
      const u = await me();
      const dest =
        loc.state?.from || (u.role === "admin" ? "/admin" : "/student");
      nav(dest, { replace: true });
    } catch (err: unknown) {
      // 3.5) Normalize server/transport errors to a user-friendly message
      setErrors({ form: await normalizeAuthError(err) });
    } finally {
      // 3.6) Always release loading flag
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 4) Uniform top bar with project title */}
      <Header title="AI Clinical Login" />

      <main className="px-4 py-10 grid place-items-center">
        {/* 5) Use noValidate so we control messaging with Zod + consent gate */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="w-full max-w-[440px] rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-5 py-3 text-base font-semibold">
            Sign in
          </div>

          <div className="p-5 space-y-4">
            {/* 5.1) Form-level (auth/server/consent) errors */}
            {errors.form && (
              <div className="rounded-md border border-orange-300 bg-orange-100 px-3 py-2 text-sm text-orange-800">
                {errors.form}
              </div>
            )}

            {/* 5.2) Email field (Zod messages) */}
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
                }`} // NOTE: w-full (fixed from w/full)
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

            {/* 5.3) Password field (Zod messages) */}
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
                }`} // NOTE: w-full (fixed from w/full)
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

            {/* 5.4) Consent checkbox (controlled; show hint only after a failed submit) */}
            <div className="flex items-start gap-2">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                aria-describedby={
                  !consent && triedSubmit ? "consent-help" : undefined
                }
              />
              <label
                htmlFor="consent"
                className="text-xs text-gray-600 leading-snug"
              >
                By clicking “Sign in”, I acknowledge and give my consent that
                any information I provide through this website may be evaluated
                by third-party artificial intelligence systems, including but
                not limited to OpenAI, for the purpose of generating feedback or
                related services.
              </label>
            </div>

            {/* 5.5) Submit button (enabled; we block in JS and show messages) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-gray-900 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            {/* 5.6) Cookie disclosure */}
            <div className="text-[11px] text-gray-600">
              &#9432; Use your assigned credentials. This site uses session
              cookies; signing in implies consent to store a session on this
              device.
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
