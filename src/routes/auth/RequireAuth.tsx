// src/routes/auth/RequireAuth.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { me } from "../../services/authApi";
import type { Role, MeResponse } from "../../types/auth";

type Props = {
  children: React.ReactNode;
  /** if provided, user must have one of these roles */
  allowedRoles?: Role[];
};

/** Protects routes; optionally enforces role. Redirects to /login or to the user's home. */
export default function RequireAuth({ children, allowedRoles }: Props) {
  const nav = useNavigate();
  const loc = useLocation();
  const [state, setState] = useState<{ loading: boolean; me?: MeResponse }>({
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const info = await me();
        if (!alive) return;
        // role gate if needed
        const isAllowed =
          !allowedRoles ||
          allowedRoles.includes(info.role) ||
          info.role === "admin";

        if (!isAllowed) {
          nav(info.role === "admin" ? "/admin" : "/student", { replace: true });
          return;
        }
        setState({ loading: false, me: info });
      } catch {
        if (!alive) return;
        nav("/login", { replace: true, state: { from: loc.pathname } });
      }
    })();
    return () => {
      alive = false;
    };
  }, [allowedRoles, loc.pathname, nav]);

  if (state.loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-gray-600">
        Checking session…
      </div>
    );
  }
  return <>{children}</>;
}
