// file: src/pages/student/submission/edit/standard/StandardSubmissionPage.tsx

import { type ReactNode, useMemo, useState } from "react";
import type { StudentSubmissionState } from "../../WeeklyWorkup";
import Tabs from "../../../../../components/Tabs";
import { BackToWeeklyWorkup } from "../../BackToWeeklyWorkup";

type TabKey = "patient" | "meds" | "drp";

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
	/**
	 * Keep mounted to preserve internal component state.
	 * Use `hidden` + `display: none` so inactive panels are not visible and not focusable.
	 */
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

export function StandardSubmissionPage({
	weeklyWorkupId,
	studentEnrollmentId,
}: StudentSubmissionState) {
	const tabItems = useMemo(
		() => [
			{ value: "patient", label: "Patient Information" },
			{ value: "meds", label: "Current Medications" },
			{ value: "drp", label: "Health Care Problems" },
		],
		[],
	);

	const [tab, setTab] = useState<TabKey>("patient");

	return (
		<div className="mx-auto w-full max-w-7xl">
			{/* Tabs + Back; break to next line on small screens*/}
			<div className="mb-8 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
				<div className="w-full md:w-auto">
					<Tabs
						value={tab}
						onChange={(v) => setTab(v as TabKey)}
						items={tabItems}
						fullWidth
					/>
				</div>

				<div className="w-full md:w-auto md:flex md:justify-end">
					<BackToWeeklyWorkup />
				</div>
			</div>

			{/* Content card */}
			<div className="rounded-4xl border border-subtle app-bg p-8">
				{/* Keep all panels mounted so state is preserved across tab switches */}
				<TabPanel
					active={tab === "patient"}
					id="tab-panel-patient"
					label="Patient Information"
				>
					<div className="text-sm font-semibold text-primary">Patient Information</div>
					<div className="mt-1 text-sm text-muted">
						Not implemented. weeklyWorkupId={weeklyWorkupId} studentEnrollmentId=
						{studentEnrollmentId}
					</div>
				</TabPanel>

				<TabPanel
					active={tab === "meds"}
					id="tab-panel-meds"
					label="Current Medications & History"
				>
					<div className="text-sm font-semibold text-primary">
						Current Medications & History
					</div>
					<div className="mt-1 text-sm text-muted">Not implemented.</div>
				</TabPanel>

				<TabPanel active={tab === "drp"} id="tab-panel-drp" label="Health Care Problems">
					<div className="text-sm font-semibold text-primary">Health Care Problems</div>
					<div className="mt-1 text-sm text-muted">Not implemented.</div>
				</TabPanel>
			</div>
		</div>
	);
}
