// file: src/pages/student/StudentLayout.tsx

import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import SettingsModalShared from "../shared/SettingsModalShared.tsx";
import { AUTH } from "../../routes.ts";
import { useSettingsProfile } from "../shared/hooks/settings.ts";
import { StudentScaffoldDrawer } from "./StudentScaffoldDrawer.tsx";
import { useStudentLayoutTabText } from "./hooks/studentLayout.ts";

export default function StudentLayout() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const nav = useNavigate();

	function handleOpenSettings() {
		setSettingsOpen(true);
	}

	const { profile } = useSettingsProfile(true);
	const tabText = useStudentLayoutTabText({ profileName: profile?.name });

	return (
		<div className="min-h-screen app-bg text-primary flex flex-col">
			<Header
				title="AI IPC Workup"
				onSettingsClick={handleOpenSettings}
				onOpenDrawer={() => setDrawerOpen(true)}
				isDrawerOpen={drawerOpen}
				tabs={tabText}
			/>

			<StudentScaffoldDrawer
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onOpenSettings={() => {
					setDrawerOpen(false);
					handleOpenSettings();
				}}
				studentName={profile?.name ? `Welcome, ${profile.name}` : "Welcome"}
			/>

			<main
				id="main-content"
				role="main"
				className="flex-1 px-4 py-6"
				aria-label="Student content"
			>
				<Outlet />
			</main>

			<SettingsModalShared
				open={settingsOpen}
				onClose={() => setSettingsOpen(false)}
				onLoggedOut={() => {
					// central redirect on logout
					nav(AUTH + "/intro", { replace: true });
				}}
			/>
		</div>
	);
}
