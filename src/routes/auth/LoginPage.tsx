// src/routes/auth/LoginPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, me } from "../../services/authApi";
import { LoginRequest } from "../../types/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // if already logged in, bounce to home by role
  useEffect(() => {
    let alive = true;
    me()
      .then((u) => {
        if (!alive) return;
        nav(u.role === "admin" ? "/admin" : "/student", { replace: true });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const payload = LoginRequest.parse({ email, password }); // strong client validation
      await login(payload); // sets HttpOnly cookie
      const u = await me();
      const dest =
        loc.state?.from || (u.role === "admin" ? "/admin" : "/student");
      nav(dest, { replace: true });
    } catch {
      setErr("Invalid credentials or input.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* top bar to match admin header height */}
      <header className="h-14 border-b flex items-center px-4">
        <div className="font-semibold">AI Clinical</div>
      </header>

      {/* centered auth card */}
      <main className="px-4 py-10 grid place-items-center">
        <form
          onSubmit={onSubmit}
          className="w-[min(440px,95vw)] rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-5 py-3 text-base font-semibold">
            Sign in
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">UGA Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="netid@uga.edu"
                autoFocus
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="••••••••"
                required
              />
            </div>

            {err && (
              <div className="rounded-md border border-orange-300 bg-orange-100 px-3 py-2 text-sm text-orange-800">
                {err}
              </div>
            )}

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
