// file: src/pages/auth/RequireAuth.tsx

import type {ReactNode} from "react";
import {useAuthGuard} from "./hooks/auth";
import type {Role} from "../../lib/types/user.ts";

type Props = {
    children: ReactNode;
    /** If provided, user must have one of these roles */
    allowedRoles?: Role[];
};

/**
 * Protects routes; optionally enforces role.
 * - If not authenticated: redirects to /login.
 * - If authenticated but wrong role: redirects to /admin or /student based on role.
 * - If ok: renders children.
 */
export default function RequireAuth({children, allowedRoles}: Props) {
    const {loading} = useAuthGuard(allowedRoles);

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center text-sm text-muted">
                Checking session…
            </div>
        );
    }

    return <>{children}</>;
}
