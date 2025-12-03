// file: src/pages/auth/RequireAuth.tsx

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { me } from "../../lib/api/shared/user";
import type { MeResponse, Role } from "../../lib/types/user";

type Props = {
  children: ReactNode;
  /** If provided, user must have one of these roles */
  allowedRoles?: Role[];
};

type AuthState = {
  loading: boolean;
  me?: MeResponse;
};

/**
 * Protects routes; optionally enforces role.
 * - If not authenticated: redirects to /login.
 * - If authenticated but wrong role: redirects to /admin or /student based on role.
 * - If ok: renders children.
 */
export default function RequireAuth({ children, allowedRoles }: Props) {
  const nav = useNavigate();
  const loc = useLocation();
  const [state, setState] = useState<AuthState>({ loading: true });

  // Keep a stable ref to allowedRoles so we don't re-run the effect on every render
  const allowedRolesRef = useRef<readonly Role[] | undefined>(allowedRoles);
  useEffect(() => {
    allowedRolesRef.current = allowedRoles;
  }, [allowedRoles]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const info = await me();
        if (!alive) return;

        const roles = allowedRolesRef.current;
        const isAllowed =
          !roles || roles.includes(info.role) || info.role === "admin";

        if (!isAllowed) {
          // Enforce role: admin -> /admin, student -> /student
          const dest = info.role === "admin" ? "/admin" : "/student";
          nav(dest, { replace: true });
          return;
        }

        setState({ loading: false, me: info });
      } catch {
        if (!alive) return;
        // Not authenticated -> go to login, remember where they came from
        nav("/login", { replace: true, state: { from: loc.pathname } });
      }
    })();

    return () => {
      alive = false;
    };
  }, [loc.pathname, nav]);

  if (state.loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}