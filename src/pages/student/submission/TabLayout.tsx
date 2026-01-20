// file: src/pages/student/submission/TabLayout.tsx

import { type ReactNode } from "react";
import { STANDARD_TABS, type TabKey } from "../hooks/constants.ts";
import Tabs from "../../../components/Tabs.tsx";

export const tabPanelId = (k: TabKey) => `tab-panel-${k}` as const;

export const labelByTabKey = STANDARD_TABS.reduce<Record<TabKey, string>>(
	(acc, it) => {
		acc[it.value] = it.label;
		return acc;
	},
	{} as Record<TabKey, string>,
);

function TabPanel({
	active,
	id,
	label,
	children,
}: {
	active: boolean;
	id: string;
	label: string;
	children: ReactNode;
}) {
	return (
		<section
			id={id}
			role="tabpanel"
			aria-label={label}
			aria-hidden={!active}
			hidden={!active}
			className={active ? "block" : "hidden"}
		>
			{children}
		</section>
	);
}

export function TabLayout({
	tab,
	setTab,
	renderPanels,
}: {
	tab: TabKey;
	setTab: (k: TabKey) => void;
	renderPanels: Record<TabKey, ReactNode>;
}) {
	return (
		<>
			<div className="mb-8">
				<Tabs
					value={tab}
					onChange={(v) => setTab(v as TabKey)}
					items={STANDARD_TABS}
					fullWidth
				/>
			</div>

			{STANDARD_TABS.map(({ value }) => (
				<TabPanel
					key={value}
					active={tab === value}
					id={tabPanelId(value)}
					label={labelByTabKey[value]}
				>
					{renderPanels[value]}
				</TabPanel>
			))}
		</>
	);
}
