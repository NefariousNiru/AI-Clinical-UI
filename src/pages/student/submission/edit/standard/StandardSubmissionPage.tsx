// file: src/pages/student/submission/edit/standard/StandardSubmissionPage.tsx

import { type ReactNode, useMemo, useState } from "react";
import type { StudentSubmissionState } from "../../WeeklyWorkup";
import Tabs from "../../../../../components/Tabs";

import PatientInformationTab from "./PatientInformationTab";
import CurrentMedicationTab from "./CurrentMedicationTab";
import HealthCareProblemTab from "./HealthCareProblemTab";
import LabsAndProgressTab from "./LabsAndProgressTab";

import {
	makeEmptyPatientInfo,
	type MedicationList,
	type PatientInfo,
	type StudentDrpAnswer,
} from "../../../../../lib/types/studentSubmission";

import { Save } from "lucide-react";
import { BackToWeeklyWorkup } from "../../BackToWeeklyWorkup.tsx";

type TabKey = "patient" | "labs" | "meds" | "drp";

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
			{ value: "patient", label: "Patient Info" },
			{ value: "labs", label: "Labs & Progress" },
			{ value: "meds", label: "Medications" },
			{ value: "drp", label: "Health Care Problems" },
		],
		[],
	);

	const [tab, setTab] = useState<TabKey>("patient");

	// TEMP local state (until wired to backend hook)
	const [patientInfo, setPatientInfo] = useState<PatientInfo>(() => makeEmptyPatientInfo());
	const [medicationList, setMedicationList] = useState<MedicationList>(
		() => makeEmptyPatientInfo().medicationList,
	);
	const [drpAnswers, setDrpAnswers] = useState<StudentDrpAnswer[]>([]);

	// TEMP save state flags (until wired to backend)
	const [saving, setSaving] = useState(false);
	const isDirty = true; // placeholder until you compute diff vs last-saved snapshot

	const logCtx = useMemo(
		() => ({ weeklyWorkupId, studentEnrollmentId }),
		[weeklyWorkupId, studentEnrollmentId],
	);

	const onSave = async () => {
		if (saving || !isDirty) return;
		setSaving(true);
		try {
			console.log("[StandardSubmission] save clicked", {
				...logCtx,
				patientInfo,
				medicationList,
				drpAnswers,
			});
			// TODO: wire to API + dirty tracking
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-7xl">
			{/* Header row: Back (left) + Save (right) */}
			<div className="mb-8 flex items-center gap-3">
				<BackToWeeklyWorkup />
				<button
					type="button"
					onClick={onSave}
					disabled={saving || !isDirty}
					className={[
						"ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
						saving || !isDirty
							? "bg-surface-subtle text-muted cursor-not-allowed border-subtle"
							: "bg-secondary text-on-secondary hover:opacity-95 border-secondary",
					].join(" ")}
					aria-label="Save progress"
				>
					<Save size={18} />
					Save
				</button>
			</div>

			{/* Tabs row (full width on small screens) */}
			<div className="mb-8">
				<Tabs
					value={tab}
					onChange={(v) => {
						const next = v as TabKey;
						console.log("[StandardSubmission] tab change", { ...logCtx, tab: next });
						setTab(next);
					}}
					items={tabItems}
					fullWidth
				/>
			</div>

			{/* Keep all panels mounted so state is preserved across tab switches */}
			<TabPanel active={tab === "patient"} id="tab-panel-patient" label="Patient Info">
				<PatientInformationTab
					value={patientInfo}
					onChange={(next) => {
						console.log("[StandardSubmission] patientInfo onChange", {
							...logCtx,
							next,
						});
						setPatientInfo(next);
					}}
				/>
			</TabPanel>

			<TabPanel active={tab === "labs"} id="tab-panel-labs" label="Labs & Progress">
				<LabsAndProgressTab
					value={patientInfo}
					onChange={(next) => {
						console.log("[StandardSubmission] patientInfo onChange (labs/progress)", {
							...logCtx,
							next,
						});
						setPatientInfo(next);
					}}
				/>
			</TabPanel>

			<TabPanel active={tab === "meds"} id="tab-panel-meds" label="Medications">
				<CurrentMedicationTab
					value={medicationList}
					onChange={(next) => {
						console.log("[StandardSubmission] medicationList onChange", {
							...logCtx,
							next,
						});
						setMedicationList(next);
						// keep patientInfo in sync too (so when you wire backend, it’s one object)
						setPatientInfo((p) => ({ ...p, medicationList: next }));
					}}
				/>
			</TabPanel>

			<TabPanel active={tab === "drp"} id="tab-panel-drp" label="Health Care Problems">
				<HealthCareProblemTab
					items={drpAnswers}
					onChange={(next) => {
						console.log("[StandardSubmission] drpAnswers onChange", {
							...logCtx,
							next,
						});
						setDrpAnswers(next);
					}}
				/>
			</TabPanel>
		</div>
	);
}
