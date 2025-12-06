// file: src/pages/admin/settings/AdminSettingsModal.tsx

import type { JSX } from "react";
import type { UserProfile } from "../../../lib/types/user";
import SettingsModalShared from "../../shared/SettingsModalShared";
import {
    useMrpToolStatus,
    isAdmin,
} from "../hooks/settings";

type SettingsModalProps = {
    open: boolean;
    onClose: () => void;
    onLoggedOut?: () => void;
};

export default function AdminSettingsModal(props: SettingsModalProps) {
    const { status, loading, error, toggle } = useMrpToolStatus(props.open);

    function renderAdminExtras(profile: UserProfile | null): JSX.Element | null {
        if (!isAdmin(profile)) return null;

        const statusLabel =
            status === null
                ? loading
                    ? "Loading…"
                    : "Unknown"
                : status === "on"
                    ? "On"
                    : "Off";

        const isOn: boolean = status === "on";

        return (
            <section className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Admin tools
                </h2>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-subtle bg-surface px-3 py-2">
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
                        onClick={toggle}
                        disabled={loading || status === null}
                        className={[
                            "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                            "focus-visible:outline-none",
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
