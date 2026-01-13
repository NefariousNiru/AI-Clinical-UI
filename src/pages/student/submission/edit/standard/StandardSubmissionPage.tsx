// file: src/pages/student/submission/edit/standard/StandardSubmissionPage.tsx

import { type ReactNode, useCallback, useMemo, useState } from "react";
import type { StudentSubmissionState } from "../../WeeklyWorkup";
import Tabs from "../../../../../components/Tabs";
import PatientInformationTab from "./PatientInformationTab";
import CurrentMedicationTab from "./CurrentMedicationTab";
import HealthCareProblemTab from "./HealthCareProblemTab";
import LabsAndProgressTab from "./LabsAndProgressTab";
import { Download, Save } from "lucide-react";
import { BackToWeeklyWorkup } from "../../BackToWeeklyWorkup.tsx";
import { useStandardSubmissionEditor } from "../../../hooks/useStandardSubmissionEditor.ts";
import { useSubmitDownloadDOCX } from "../../../hooks/useSubmitDownloadDOCX.ts";

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

	// Shared editor core (load + hydrate + dirty tracking + save)
	const editor = useStandardSubmissionEditor({
		weeklyWorkupId,
		studentEnrollmentId,
	});

	// Shared submit + download behavior
	const { downloading, download } = useSubmitDownloadDOCX(editor);

	/**
	 * no-op if not dirty <br>
	 * save with isSubmit=false as this is a save action not a submit action
	 */
	const onSave = useCallback(async () => {
		await editor.saveIfDirty({ isSubmit: false });
	}, [editor]);

	// Show a loading shell while submission is being fetched/hydrated.
	if (editor.loading) {
		return (
			<div className="mx-auto w-full max-w-7xl">
				<div className="rounded-xl border border-subtle app-bg p-5">
					<div className="text-sm font-semibold text-primary">Loading workup...</div>
					<div className="mt-1 text-sm text-muted">Preparing your editor.</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-7xl">
			{/* Header row: Back (left) + Save/Submit (right) */}
			<div className="mb-8 flex flex-wrap items-center gap-3">
				<div className="shrink-0">
					<BackToWeeklyWorkup />
				</div>

				<div className="flex w-full flex-wrap items-center justify-start gap-3 md:ml-auto md:w-auto md:flex-nowrap">
					<button
						type="button"
						disabled={editor.saving || downloading}
						onClick={download}
						className={[
							"inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm",
							"bg-accent text-on-accent",
							editor.saving || downloading ? "opacity-60" : "",
						].join(" ")}
						aria-label="Submit and download DOCX"
					>
						<Download size={16} />
						{downloading ? "Submitting & Preparing DOCX..." : "Submit & Download DOCX"}
					</button>

					<button
						type="button"
						onClick={onSave}
						disabled={editor.saving || !editor.isDirty}
						className={[
							"inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
							editor.saving || !editor.isDirty
								? "bg-surface-subtle text-muted cursor-not-allowed border-subtle"
								: "bg-secondary text-on-secondary hover:opacity-95 border-secondary",
						].join(" ")}
						aria-label="Save progress"
					>
						<Save size={18} />
						Save
					</button>
				</div>
			</div>

			{/* Error banner (non-blocking) */}
			{editor.error && (
				<div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
					{editor.error}
				</div>
			)}

			{/* Tabs row */}
			<div className="mb-8">
				<Tabs
					value={tab}
					onChange={(v) => setTab(v as TabKey)}
					items={tabItems}
					fullWidth
				/>
			</div>

			{/* Panels - keep mounted so internal state is preserved across tab switches */}
			<TabPanel active={tab === "patient"} id="tab-panel-patient" label="Patient Info">
				<PatientInformationTab
					value={editor.patient.patientInfo}
					onChange={(next) => editor.patient.setPatientInfo(next)}
				/>
			</TabPanel>

			<TabPanel active={tab === "labs"} id="tab-panel-labs" label="Labs & Progress">
				<LabsAndProgressTab
					value={editor.patient.patientInfo}
					onChange={(next) => editor.patient.setPatientInfo(next)}
				/>
			</TabPanel>

			<TabPanel active={tab === "meds"} id="tab-panel-meds" label="Medications">
				<CurrentMedicationTab patient={editor.patient} />
			</TabPanel>

			<TabPanel active={tab === "drp"} id="tab-panel-drp" label="Health Care Problems">
				<HealthCareProblemTab
					items={editor.studentDrpAnswers}
					onChange={(next) => editor.setStudentDrpAnswers(next)}
				/>
			</TabPanel>

			<div className="mb-5" />
		</div>
	);
}
