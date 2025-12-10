// file: src/pages/auth/AutoHome.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBootstrapUserRole } from "./hooks/auth";

export default function AutoHome() {
    const nav = useNavigate();
    const { status, role } = useBootstrapUserRole();

    // Decide where to go based on bootstrap status
    useEffect(() => {
        if (status === "success" && role) {
            const dest = role === "admin" ? "/admin" : "/student";
            nav(dest, { replace: true });
        } else if (status === "error") {
            nav("/auth/login", { replace: true });
        }
    }, [status, role, nav]);

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
