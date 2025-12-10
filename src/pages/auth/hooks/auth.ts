// file: src/pages/auth/hooks/auth.ts

import {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {me} from "../../../lib/api/shared/user";
import type {MeResponse, Role} from "../../../lib/types/user";
import {activateAccount} from "../../../lib/api/public/auth";
import type {UserActivationRequest} from "../../../lib/types/auth";

export type BootstrapStatus = "idle" | "loading" | "success" | "error";

type UseBootstrapUserRoleResult = {
    status: BootstrapStatus;
    role: MeResponse["role"] | null;
    error: string | null;
};

/**
 * Bootstraps the current user's role using `GET /api/v1/shared/me`.
 *
 * - On mount, calls `me()`.
 * - Exposes `status`, `role`, and a normalized `error` message.
 * - Does not perform navigation; the caller decides what to do with the result.
 */
export function useBootstrapUserRole(): UseBootstrapUserRoleResult {
    const [status, setStatus] = useState<BootstrapStatus>("loading");
    const [role, setRole] = useState<MeResponse["role"] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        async function load() {
            setStatus("loading");
            setError(null);

            try {
                const u: MeResponse = await me();
                if (!alive) return;

                setRole(u.role);
                setStatus("success");
            } catch (e) {
                if (!alive) return;

                const msg =
                    e instanceof Error && e.message.trim()
                        ? e.message
                        : "Failed to load current user.";
                setError(msg);
                setRole(null);
                setStatus("error");
            }
        }

        void load();

        return () => {
            alive = false;
        };
    }, []);

    return {status, role, error};
}

/* ------------------------------------------------------------------ */
/* Auth guard hook used by <RequireAuth>                              */
/* ------------------------------------------------------------------ */

type UseAuthGuardResult = {
    loading: boolean;
    me: MeResponse | null;
};

/**
 * Route guard hook.
 *
 * - Calls `me()` to check authentication.
 * - If unauthenticated: redirects to `/login` and stores `from` pathname.
 * - If authenticated but not in `allowedRoles` (except admin bypass):
 *     redirects to `/admin` or `/student` based on actual role.
 * - If ok: returns `{ loading: false, me }`.
 */
export function useAuthGuard(allowedRoles?: Role[]): UseAuthGuardResult {
    const nav = useNavigate();
    const loc = useLocation();

    const [loading, setLoading] = useState<boolean>(true);
    const [currentUser, setCurrentUser] = useState<MeResponse | null>(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const info = await me();
                if (!alive) return;

                const roles = allowedRoles;
                const isAllowed =
                    !roles || roles.includes(info.role) || info.role === "admin";

                if (!isAllowed) {
                    // Enforce role: admin -> /admin, student -> /student
                    const dest = info.role === "admin" ? "/admin" : "/student";
                    nav(dest, {replace: true});
                    return;
                }

                setCurrentUser(info);
                setLoading(false);
            } catch {
                if (!alive) return;

                // Not authenticated -> go to login, remember where they came from
                nav("/login", {replace: true, state: {from: loc.pathname}});
            }
        })();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loc.pathname, nav, JSON.stringify(allowedRoles)]);

    return {loading, me: currentUser};
}

/* ------------------------------------------------------------------ */
/* Account activation hook                                            */
/* ------------------------------------------------------------------ */

type UseAccountActivationResult = {
    loading: boolean;
    error: string | null;
    success: boolean;
    activate: (payload: UserActivationRequest) => Promise<void>;
};

/**
 * Account activation hook.
 *
 * - Wraps `POST /api/v1/public/auth/activate/account`.
 * - Uses the shared `http` client through `activateAccount`.
 */
export function useAccountActivation(): UseAccountActivationResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const activate = async (payload: UserActivationRequest) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await activateAccount(payload);
            setSuccess(true);
        } catch (err) {
            const msg =
                err instanceof Error && err.message.trim()
                    ? err.message
                    : "Failed to activate account. Contact support";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return {loading, error, success, activate};
}