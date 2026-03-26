// file: src/pages/student/submission/standard/StandardSubmissionPage.tsx

import { useCallback, useMemo, useState } from "react";
import type { StudentSubmissionState } from "../WeeklyWorkup.tsx";
import { Download, Save } from "lucide-react";
import { BackToWeeklyWorkup } from "../../../shared/submission/BackToWeeklyWorkup.tsx";
import { useStandardSubmissionEditor } from "../../hooks/useStandardSubmissionEditor.ts";
import { useSubmitDownloadDOCX } from "../../hooks/useSubmitDownloadDOCX.ts";
import { TabLayout } from "../../../shared/submission/TabLayout.tsx";
import PatientInformationTab from "./PatientInformationTab.tsx";
import LabsAndProgressTab from "./LabsAndProgressTab.tsx";
import CurrentMedicationTab from "./CurrentMedicationTab.tsx";
import HealthCareProblemTab from "./HealthCareProblemTab.tsx";
import type { TabKey } from "../../hooks/constants.ts";

export function StandardSubmissionPage({
	weeklyWorkupId,
	studentEnrollmentId,
}: StudentSubmissionState) {
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
		const res = await editor.saveIfDirty({ isSubmit: false });
		if (res === "FAILED") return;
	}, [editor]);

	// Panels for each Tab
	const panels = useMemo(
		() => ({
			patient: (
				<PatientInformationTab
					value={editor.patient.patientInfo}
					onChange={(next) => editor.patient.setPatientInfo(next)}
				/>
			),
			labs: (
				<LabsAndProgressTab
					value={editor.patient.patientInfo}
					onChange={(next) => editor.patient.setPatientInfo(next)}
				/>
			),
			meds: <CurrentMedicationTab patient={editor.patient} />,
			drp: (
				<HealthCareProblemTab
					items={editor.studentDrpAnswers}
					onChange={(next) => editor.setStudentDrpAnswers(next)}
				/>
			),
		}),
		[editor],
	);

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

			<TabLayout tab={tab} setTab={setTab} renderPanels={panels} />

			<div className="mb-5" />
		</div>
	);
}
