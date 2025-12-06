// file: src/pages/admin/settings/AdminModalShared.tsx

import type { UserProfile } from "../../../lib/types/user";
import SettingsModalShared from "../../shared/SettingsModalShared.tsx";

type SettingsModalProps = {
    open: boolean;
    onClose: () => void;
    onLoggedOut?: () => void;
};

export default function AdminSettingsModal(props: SettingsModalProps) {
    return (
        <SettingsModalShared
            {...props}
            renderExtraSections={(profile: UserProfile | null) => {
                if (!profile || profile.role !== "admin") return null;

                return (
                    <section className="space-y-2">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                            Admin tools
                        </h2>
                        <div className="rounded-lg border border-subtle bg-surface-subtle px-3 py-2 text-xs text-muted">
                            {/* TODO: add your real admin controls here */}
                            <p className="text-primary font-medium mb-1">
                                Admin-only settings
                            </p>
                            <p>
                                This area is visible only for admins. You can add feature
                                toggles, debug switches, or links to admin dashboards here.
                            </p>
                        </div>
                    </section>
                );
            }}
        />
    );
}