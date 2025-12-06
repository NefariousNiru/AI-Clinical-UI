// file: src/pages/shared/hooks/settings.ts

import {useEffect, useState} from "react";
import {userProfile} from "../../../lib/api/shared/user";
import type {UserProfile} from "../../../lib/types/user";

type UseSettingsProfileResult = {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    reload: () => void;
};

/**
 * Fetches the current user profile for the Settings modal.
 *
 * - Only fires when `open` is true.
 * - Exposes `profile`, `loading`, `error`, and a `reload` function.
 */
export function useSettingsProfile(open: boolean): UseSettingsProfileResult {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0); // for manual reloads

    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        userProfile()
            .then((p) => {
                if (cancelled) return;
                setProfile(p);
            })
            .catch(() => {
                if (cancelled) return;
                setProfile(null);
                setError("Could not load profile");
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, version]);

    function reload(): void {
        // bump version to retrigger effect if we ever need it
        setVersion((v) => v + 1);
    }

    return {profile, loading, error, reload};
}
