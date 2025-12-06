// file: src/pages/admin/settings/AdminModalShared.tsx

import {type JSX, useEffect, useState} from "react";
import type {UserProfile} from "../../../lib/types/user";
import SettingsModalShared from "../../shared/SettingsModalShared.tsx";
import {
    fetchMrpToolStatus,
    toggleMrpToolStatus,
} from "../../../lib/api/admin/settings";

type SettingsModalProps = {
    open: boolean;
    onClose: () => void;
    onLoggedOut?: () => void;
};

type MrpToolStatus = "on" | "off";

export default function AdminSettingsModal(props: SettingsModalProps) {
    const [status, setStatus] = useState<MrpToolStatus | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Load status whenever the modal opens
    useEffect(() => {
        if (!props.open) return;

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
    }, [props.open]);

    async function handleToggle(): Promise<void> {
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

    function renderAdminExtras(profile: UserProfile | null): JSX.Element | null {
        if (!profile || profile.role !== "admin") return null;

        const statusLabel =
            status === null
                ? loading
                    ? "Loading…"
                    : "Unknown"
                : status === "on"
                    ? "On"
                    : "Off";

        const isOn = status === "on";

        return (
            <section className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Admin tools
                </h2>

                <div
                    className="mt-3 rounded-lg border border-subtle bg-surface px-3 py-2 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-primary">
                            Current Status of MRP Tool (Training Wheels):
                        </p>
                        <p className="text-xs">
                            <span className={isOn ? "text-accent font-medium" : "text-muted"}>
                              {statusLabel}
                            </span>
                        </p>
                        {error && (
                            <p className="text-[11px] text-danger" role="status">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={loading || status === null}
                        className={[
                            "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                            "focus-visible:outline-none", // global focus ring handles outline
                            isOn
                                ? "bg-secondary text-on-secondary hover:opacity-90"
                                : "bg-surface-subtle border border-subtle text-primary hover:bg-accent-soft hover:text-accent",
                            loading || status === null ? "opacity-60 cursor-not-allowed" : "",
                        ].join(" ")}
                        aria-pressed={isOn}
                        aria-label="Toggle MRP Tool training wheels"
                    >
                        {loading ? "Working…" : "Toggle"}
                    </button>
                </div>
            </section>
        );
    }

    return (
        <SettingsModalShared
            {...props}
            renderExtraSections={renderAdminExtras}
        />
    );
}
