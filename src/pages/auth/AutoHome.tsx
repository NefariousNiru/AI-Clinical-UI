// file: src/pages/auth/AutoHome.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { me } from "../../lib/api/shared/user";
import type { MeResponse } from "../../lib/types/user";

export default function AutoHome() {
  const nav = useNavigate();

  useEffect(() => {
    let alive = true;

    me()
      .then((u: MeResponse) => {
        if (!alive) return;
        const dest = u.role === "admin" ? "/admin" : "/student";
        nav(dest, { replace: true });
      })
      .catch(() => {
        if (!alive) return;
        nav("/login", { replace: true });
      });

    return () => {
      alive = false;
    };
  }, [nav]);

  return (
    <main
      id="main-content"
      role="main"
      aria-busy="true"
      className="min-h-screen app-bg text-primary flex flex-col items-center justify-center"
    >
      <div className="w-10 h-10 border-4 border-subtle rounded-full animate-spin" />
      <p className="mt-4 text-sm text-muted font-medium">
        Redirecting to your dashboard…
      </p>
    </main>
  );
}

