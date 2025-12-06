// file: src/pages/admin/hooks/settings.ts

import { useEffect, useState } from "react";
import {
    toggleMrpToolStatus,
} from "../../../lib/api/admin/settings";
import {
    fetchMrpToolStatus,
} from "../../../lib/api/shared/settings";
import type { UserProfile } from "../../../lib/types/user";

export type MrpToolStatus = "on" | "off";

export type UseMrpToolStatusResult = {
    status: MrpToolStatus | null;
    loading: boolean;
    error: string | null;
    toggle: () => Promise<void>;
};

/**
 * Hook to manage MRP tool (training wheels) status.
 *
 * - Loads status when `open` becomes true.
 * - Exposes `status`, `loading`, `error`, and `toggle()`.
 * - Only admins should see UI driven by this; hook itself just manages state.
 */
export function useMrpToolStatus(open: boolean): UseMrpToolStatusResult {
    const [status, setStatus] = useState<MrpToolStatus | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Load status whenever the modal opens
    useEffect(() => {
        if (!open) return;

        let active = true;

        async function loadStatus(): Promise<void> {
            setLoading(true);
            setError(null);
            try {
                const value = await fetchMrpToolStatus();
                if (!active) return;
                setStatus(value ? "on" : "off");
            } catch (e) {
                if (!active) return;
                const msg =
                    e instanceof Error && e.message.trim()
                        ? e.message
                        : "Failed to load MRP tool status.";
                setError(msg);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadStatus();

        return () => {
            active = false;
        };
    }, [open]);

    async function toggle(): Promise<void> {
        if (loading || status === null) return;

        const next: MrpToolStatus = status === "on" ? "off" : "on";
        setLoading(true);
        setError(null);

        try {
            await toggleMrpToolStatus();
            setStatus(next);
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to toggle MRP tool status.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return { status, loading, error, toggle };
}

/**
 * Helper: check if admin and MRP tooling should be visible.
 * Not strictly required, but can be useful if you reuse admin extras.
 */
export function isAdmin(profile: UserProfile | null): boolean {
    return !!profile && profile.role === "admin";
}
