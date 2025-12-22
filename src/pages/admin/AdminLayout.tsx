// file: src/pages/admin/AdminLayout.tsx

import {useState} from "react";
import {Outlet, useNavigate} from "react-router-dom";
import Header from "../../components/Header";
import {AdminTabs} from "./AdminTabs";
import {AdminScaffoldDrawer} from "./AdminScaffoldDrawer";
import AdminSettingsModal from "./settings/AdminSettingsModal.tsx";
import {AUTH} from "../../routes.ts";

export default function AdminLayout() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const nav = useNavigate();

    function handleOpenSettings() {
        setSettingsOpen(true);
    }

    return (
        <div className="min-h-screen app-bg text-primary flex flex-col">
            <Header
                title="AI Clinical Admin"
                tabs={<AdminTabs variant="header"/>}
                onSettingsClick={handleOpenSettings}
                onOpenDrawer={() => setDrawerOpen(true)}
                isDrawerOpen={drawerOpen}
            />

            <AdminScaffoldDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onOpenSettings={handleOpenSettings}
            />

            <main
                id="main-content"
                role="main"
                className="flex-1 px-4 py-6"
                aria-label="Admin content"
            >
                <Outlet/>
            </main>

            <AdminSettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                onLoggedOut={() => {
                    // central redirect on logout
                    nav(AUTH + "/intro", {replace: true});
                }}
            />
        </div>
    );
}

