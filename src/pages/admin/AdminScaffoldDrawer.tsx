// file: src/pages/admin/AdminScaffoldDrawer.tsx

import SharedScaffoldDrawer from "../shared/SharedScaffoldDrawer";
import {AdminTabs} from "./AdminTabs";

type AdminScaffoldDrawerProps = {
    open: boolean;
    onClose: () => void;
    onOpenSettings?: () => void;
};

/**
 * Hamburger drawer used on mobile for Admin layout.
 */
export function AdminScaffoldDrawer({open, onClose, onOpenSettings}: AdminScaffoldDrawerProps) {
    return (
        <SharedScaffoldDrawer
            open={open}
            onClose={onClose}
            onOpenSettings={onOpenSettings}
            drawerId="admin-drawer"
            title="AI Clinical Admin"
            sectionLabel="Navigation"
            section={<AdminTabs variant="drawer" onNavigate={onClose}/>}
            actionsLabel="Actions"
        />
    );
}
