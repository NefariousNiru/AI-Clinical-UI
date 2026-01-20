// file: src/pages/student/submission/view/ViewSubmissionPage.tsx

import { useEffect, useMemo, useState } from "react";
import type { ViewStatus } from "../../../../lib/types/studentWeeks.ts";
import {
	makeEmptyStudentSubmissionPayload,
	type StudentSubmissionPayload,
} from "../../../../lib/types/studentSubmission.ts";
import type { TabKey } from "../../hooks/constants.ts";
import { getStudentFeedback, getStudentSubmission } from "../../../../lib/api/shared/student.ts";
import PatientInformationViewTab from "./PatientInformationViewTab.tsx";
import { BackToWeeklyWorkup } from "../BackToWeeklyWorkup.tsx";
import { TabLayout } from "../TabLayout.tsx";
import LabsAndProgressViewTab from "./LabsAndProgressViewTab.tsx";
import CurrentMedicationsViewTab from "./CurrentMedicationsViewTab.tsx";
import HealthCareProblemViewTab from "./HealthCareProblemViewTab.tsx";
import type { ProblemFeedbackList } from "../../../../lib/types/feedback.ts";

export function ViewSubmissionPage({
	weeklyWorkupId,
	studentEnrollmentId,
	status,
}: {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
	status: ViewStatus;
}) {
	const [tab, setTab] = useState<TabKey>("patient");

	const [loading, setLoading] = useState<boolean>(
		status === "grading" || status === "feedback_available",
	);
	const [error, setError] = useState<string | null>(null);

	const [payload, setPayload] = useState<StudentSubmissionPayload>(
		makeEmptyStudentSubmissionPayload(),
	);

	const [drpFeedback, setDrpFeedback] = useState<ProblemFeedbackList | null>(null);
	const [drpFeedbackError, setDrpFeedbackError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function run() {
			if (status !== "grading" && status !== "feedback_available") return;

			setLoading(true);
			setError(null);

			// clear feedback state when not in feedback mode
			if (status !== "feedback_available") {
				setDrpFeedback(null);
				setDrpFeedbackError(null);
			}

			try {
				if (status === "feedback_available") {
					// Run concurrently. If feedback fails, we still want submission.
					const submissionPromise = getStudentSubmission({
						weeklyWorkupId,
						studentEnrollmentId,
					});
					const feedbackPromise = getStudentFeedback({
						weeklyWorkupId,
						studentEnrollmentId,
					});

					const res = await submissionPromise;
					if (!cancelled) setPayload(res);

					try {
						const fb = await feedbackPromise;
						if (!cancelled) {
							setDrpFeedback(fb);
							setDrpFeedbackError(null);
						}
					} catch (e: any) {
						if (!cancelled) {
							setDrpFeedback(null);
							setDrpFeedbackError(e?.message ?? "Failed to load feedback.");
						}
					}
				} else {
					const res = await getStudentSubmission({ weeklyWorkupId, studentEnrollmentId });
					if (!cancelled) setPayload(res);
				}
			} catch (e: any) {
				if (!cancelled) setError(e?.message ?? "Failed to load submission.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		void run();
		return () => {
			cancelled = true;
		};
	}, [status, weeklyWorkupId, studentEnrollmentId]);

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
			<div className="mx-auto w-full max-w-4xl">
				<div className="rounded-xl border border-subtle app-bg p-5">
					<div className="text-sm font-semibold text-primary">Loading submission...</div>
					<div className="mt-1 text-sm text-muted">Preparing viewer.</div>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-7xl">
			<div className="mb-8 flex flex-wrap items-center gap-3">
				<div className="shrink-0">
					<BackToWeeklyWorkup />
				</div>
			</div>

			{error && (
				<div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
					{error}
				</div>
			)}

			<TabLayout tab={tab} setTab={setTab} renderPanels={panels} />

			<div className="mb-5" />
		</div>
	);
}
