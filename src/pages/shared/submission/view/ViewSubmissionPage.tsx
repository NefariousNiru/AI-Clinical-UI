// file: src/pages/shared/submission/view/ViewSubmissionPage.tsx

import { useMemo, useState } from "react";
import type { ViewStatus } from "../../../../lib/types/studentWeeks.ts";
import type { TabKey } from "../../../student/hooks/constants.ts";
import PatientInformationViewTab from "./PatientInformationViewTab.tsx";
import { BackToWeeklyWorkup } from "../BackToWeeklyWorkup.tsx";
import { TabLayout } from "../TabLayout.tsx";
import LabsAndProgressViewTab from "./LabsAndProgressViewTab.tsx";
import CurrentMedicationsViewTab from "./CurrentMedicationsViewTab.tsx";
import HealthCareProblemViewTab from "./HealthCareProblemViewTab.tsx";
import { InstructorCommentBox } from "./InstructorCommentBox.tsx";
import { useSubmissionView } from "../../hooks/submission.ts";

export function ViewSubmissionPage({
	weeklyWorkupId,
	studentEnrollmentId,
	status,
	embedded = false,
	showInstructorComment = false,
	instructorCommentEditable = false,
}: {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
	status: ViewStatus;
	embedded?: boolean;

	// admin-only feature
	showInstructorComment?: boolean;
	instructorCommentEditable?: boolean;
}) {
	const [tab, setTab] = useState<TabKey>("patient");

	const { loading, error, payload, drpFeedback, drpFeedbackError } = useSubmissionView({
		weeklyWorkupId,
		studentEnrollmentId,
		status,
	});

	const panels = useMemo(
		() => ({
			patient: (
				<PatientInformationViewTab
					mrpToolData={payload.patientInfo.mrpToolData}
					patientDemographics={payload.patientInfo.patientDemographics}
					socialHistory={payload.patientInfo.socialHistory}
					medicalHistory={payload.patientInfo.medicalHistory}
				/>
			),
			labs: (
				<LabsAndProgressViewTab
					labResult={payload.patientInfo.labResult}
					progressNotes={payload.patientInfo.progressNotes}
				/>
			),
			meds: <CurrentMedicationsViewTab medicationList={payload.patientInfo.medicationList} />,
			drp: (
				<HealthCareProblemViewTab
					mode={status}
					items={payload.studentDrpAnswers}
					feedback={status === "feedback_available" ? drpFeedback : null}
					feedbackError={status === "feedback_available" ? drpFeedbackError : null}
				/>
			),
		}),
		[payload, status, drpFeedback, drpFeedbackError],
	);

	if (loading) {
		return (
			<div className={embedded ? "w-full" : "mx-auto w-full max-w-4xl"}>
				<div className="rounded-xl border border-subtle app-bg p-5">
					<div className="text-sm font-semibold text-primary">Loading submission...</div>
					<div className="mt-1 text-sm text-muted">Preparing viewer.</div>
				</div>
			</div>
		);
	}

	return (
		<div className={embedded ? "w-full" : "mx-auto w-full max-w-7xl"}>
			{!embedded ? (
				<div className="mb-8 flex flex-wrap items-center gap-3">
					<div className="shrink-0">
						<BackToWeeklyWorkup />
					</div>
				</div>
			) : null}

			{error ? (
				<div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
					{error}
				</div>
			) : null}

			{showInstructorComment ? (
				<div className="mb-4">
					<InstructorCommentBox
						weeklyWorkupId={weeklyWorkupId}
						studentEnrollmentId={studentEnrollmentId}
						editable={instructorCommentEditable}
					/>
				</div>
			) : null}

			<TabLayout tab={tab} setTab={setTab} renderPanels={panels} />

			<div className="mb-5" />
		</div>
	);
}
