// file: src/pages/admin/hooks/settings.ts

import {useCallback, useEffect, useMemo, useState} from "react";
import {toggleMrpToolStatus} from "../../../lib/api/admin/settings";
import {useMrpToolStatus as useMrpToolStatusShared} from "../../shared/hooks/mrpToolStatus";
import type {UserProfile} from "../../../lib/types/user";

export type MrpToolStatus = "on" | "off";

export type UseMrpToolStatusResult = {
    status: MrpToolStatus | null;
    loading: boolean;
    error: string | null;
    toggle: () => Promise<void>;
};

/**
 * Admin adapter around shared MRP status hook.
 *
 * - Only loads shared status when `open` is true.
 * - Toggle calls admin endpoint, then refreshes shared status.
 */
export function useAdminMrpToolStatus(open: boolean): UseMrpToolStatusResult {
    const shared = useMrpToolStatusShared(); // { enabled, loading, error, refresh }

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load when modal opens
    useEffect(() => {
        if (!open) return;
        void shared.refresh();
        // clear any prior admin errors when opening
        setError(null);
    }, [open, shared]);

    const status: MrpToolStatus | null = useMemo(() => {
        if (!open) return null; // don't show stale state while closed
        if (shared.loading) return null;
        return shared.enabled ? "on" : "off";
    }, [open, shared.enabled, shared.loading]);

    const combinedLoading = loading || (open && shared.loading);
    const combinedError = error ?? (open ? shared.error : null);

    const toggle = useCallback(async () => {
        if (!open) return;
        if (combinedLoading) return;

        setLoading(true);
        setError(null);

        try {
            await toggleMrpToolStatus();
            await shared.refresh();
        } catch (e) {
            const msg =
                e instanceof Error && e.message.trim()
                    ? e.message
                    : "Failed to toggle MRP tool status.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [open, combinedLoading, shared]);

    return {status, loading: combinedLoading, error: combinedError, toggle};
}

export function isAdmin(profile: UserProfile | null): boolean {
    return !!profile && profile.role === "admin";
}
