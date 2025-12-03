// file: src/pages/auth/LoginPage.tsx

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

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { normalizeAuthError } from "../../lib/api/errors";
import { login } from "../../lib/api/public/auth";
import { LoginRequest } from "../../lib/types/auth";
import { me } from "../../lib/api/shared/user";
import type { MeResponse } from "../../lib/types/user";

type LocationState = { from?: string };
type FieldErrors = { email?: string; password?: string; form?: string };

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: LocationState };

  // 0) Controlled fields + UI state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [consent, setConsent] = useState<boolean>(false);
  const [triedSubmit, setTriedSubmit] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  // 1) If already signed in, route by role
  useEffect(() => {
    let alive = true;
    me()
      .then((u: MeResponse) => {
        if (!alive) return;
        nav(u.role === "admin" ? "/admin" : "/student", { replace: true });
      })
      .catch(() => {
        // ignore 401 on first load
      });
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
    setTriedSubmit(true);
    setLoading(true);

    try {
      // 3.1) Zod validation (client-side, no network)
      const parsed = LoginRequest.safeParse({ email, password });
      if (!parsed.success) {
        const fieldErrs: FieldErrors = {};
        for (const issue of parsed.error.issues) {
          const path0 = issue.path[0];
          if (path0 === "email" || path0 === "password") {
            const key: keyof FieldErrors = path0;
            fieldErrs[key] = issue.message;
          }
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
      const u: MeResponse = await me();
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
    <div className="min-h-screen app-bg text-primary flex flex-col">
      {/* Top bar with theme toggle */}
      <Header title="AI Clinical Login" />

      <main
        id="main-content"
        role="main"
        aria-label="Login form"
        className="px-4 py-10 grid place-items-center flex-1"
      >
        {/* Use noValidate so we control messaging with Zod + consent gate */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="w-full max-w-[440px] rounded-lg border border-subtle bg-surface shadow-sm"
        >
          <div className="border-b border-subtle px-5 py-3 text-base font-semibold">
            Sign in
          </div>

          <div className="p-5 space-y-4">
            {/* Form-level (auth/server/consent) errors */}
            {errors.form && (
              <div className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger">
                {errors.form}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-muted">
                UGA Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  if (errors.email) clearFieldError("email");
                }}
                className={[
                  "w-full rounded-md border bg-input px-3 py-2 text-base",
                  "focus:outline-none focus:ring-1",
                  errors.email ? "border-danger" : "border-subtle",
                ].join(" ")}
                placeholder="netid@uga.edu"
                autoFocus
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-danger">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(ev) => {
                  setPassword(ev.target.value);
                  if (errors.password) clearFieldError("password");
                }}
                className={[
                  "w-full rounded-md border bg-input px-3 py-2 text-base",
                  "focus:outline-none focus:ring-1",
                  errors.password ? "border-danger" : "border-subtle",
                ].join(" ")}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                required
              />
              {errors.password && (
                <p id="password-error" className="text-xs text-danger">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Consent checkbox (controlled; show hint only after a failed submit) */}
            <div className="flex items-start gap-2">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(ev) => setConsent(ev.target.checked)}
                className="mt-1 h-4 w-4 rounded border-subtle bg-input"
                aria-describedby={
                  !consent && triedSubmit ? "consent-help" : undefined
                }
              />
              <label
                htmlFor="consent"
                className="text-xs text-muted leading-snug"
              >
                By clicking “Sign in”, I acknowledge and give my consent that
                any information I provide through this website may be evaluated
                by third-party artificial intelligence systems, including but
                not limited to OpenAI, for the purpose of generating feedback or
                related services.
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-accent text-on-accent text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            {/* Cookie disclosure */}
            <div className="text-[11px] text-muted">
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
