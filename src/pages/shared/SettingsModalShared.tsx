// file: src/pages/shared/SettingsModalShared.tsx

import { useEffect, useState, type ReactNode } from "react";
import Modal from "../../components/Modal";
import { logout } from "../../lib/api/public/auth";
import { userProfile } from "../../lib/api/shared/user";
import type { UserProfile } from "../../lib/types/user";
import {Flag, LogOut} from 'lucide-react';
import {capitalizeFirst} from "../../lib/functions.ts";

type SharedSettingsModalProps = {
    open: boolean;
    onClose: () => void;
    onLoggedOut?: () => void;
    /**
     * Optional hook for role-based or feature-based extra sections.
     * Admin wrapper can use this to inject additional cards.
     */
    renderExtraSections?: (profile: UserProfile | null) => ReactNode;
};

export default function SettingsModalShared({
                                                open,
                                                onClose,
                                                onLoggedOut,
                                                renderExtraSections,
                                            }: SharedSettingsModalProps) {
    const [busyLogout, setBusyLogout] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Fetch user profile when modal first opens
    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        setLoadingProfile(true);
        setProfileError(null);

        userProfile()
            .then((p) => {
                if (!cancelled) {
                    setProfile(p);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setProfileError("Could not load profile");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingProfile(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [open]);

    async function handleLogout() {
        if (busyLogout) return;
        setBusyLogout(true);
        try {
            await logout();
            onClose();
            onLoggedOut?.();
        } finally {
            setBusyLogout(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Settings"
            className="w-[min(480px,95vw)]"
        >
            <div className="space-y-6 text-sm">
                {/* Profile section */}
                <section className="space-y-1">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Account
                    </h2>

                    {loadingProfile && (
                        <p className="text-muted">Loading profile…</p>
                    )}

                    {!loadingProfile && profile && (
                        <div className="rounded-lg border border-subtle bg-surface-subtle px-3 py-2">
                            <div className="font-medium text-primary">
                                {profile.name}
                            </div>
                            <div className="text-xs text-muted">{profile.email}</div>
                            <div className="mt-2 inline-flex items-center rounded-full border border-subtle bg-secondary text-on-secondary px-2 py-0.5 text-[11px] text-muted">
                                Role: {capitalizeFirst(profile.role)}
                            </div>
                        </div>
                    )}

                    {!loadingProfile && profileError && (
                        <p className="text-xs text-danger">{profileError}</p>
                    )}
                </section>

                {/* Role- / feature-specific extra sections (e.g., admin-only card) */}
                {renderExtraSections?.(profile)}


                {/* Actions section: complaints + logout */}
                <section className="space-y-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Actions
                    </h2>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() =>
                                window.open(
                                    "https://outlook.office.com/mail/deeplink/compose?to=nirupomboseroy@uga.edu,rpalmer@uga.edu",
                                    "_blank",
                                )
                            }
                            className="inline-flex flex-1 items-center justify-center rounded-4xl bg-secondary text-on-secondary px-3 py-2 text-xs font-medium"
                        >
                            Complaints?
                            <span><Flag className="px-1"></Flag></span>
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={busyLogout}
                            className="inline-flex flex-1 items-center justify-center rounded-4xl border border-subtle bg-surface px-3 py-2 text-xs font-medium text-primary hover:bg-surface disabled:opacity-60"
                        >
                            {busyLogout ? "Logging out…" : "Logout"}
                            <span><LogOut className="px-1"></LogOut></span>
                        </button>
                    </div>
                </section>
            </div>
        </Modal>
    );
}