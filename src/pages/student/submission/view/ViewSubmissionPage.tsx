// file: src/pages/student/submission/view/ViewSubmissionPage.tsx

import { useEffect, useMemo, useState } from "react";
import type { ViewStatus } from "../../../../lib/types/studentWeeks.ts";
import {
	makeEmptyStudentSubmissionPayload,
	type StudentSubmissionPayload,
} from "../../../../lib/types/studentSubmission.ts";
import type { TabKey } from "../../hooks/constants.ts";
import { getStudentSubmission } from "../../../../lib/api/shared/student.ts";
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

	const [loading, setLoading] = useState<boolean>(status === "grading");
	const [error, setError] = useState<string | null>(null);
	const [payload, setPayload] = useState<StudentSubmissionPayload>(
		makeEmptyStudentSubmissionPayload(),
	);

	// TODO Placeholder for FEEDBACK API
	const [drpFeedback, setDrpFeedback] = useState<ProblemFeedbackList | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function run() {
			if (status !== "grading" && status !== "feedback_available") return;

			setLoading(true);
			setError(null);

			try {
				const res = await getStudentSubmission({ weeklyWorkupId, studentEnrollmentId });
				if (!cancelled) setPayload(res);

				if (status === "feedback_available") {
					// TODO: call feedback API and setDrpFeedback(...)
					// const fb = await getProblemFeedback({ weeklyWorkupId, studentEnrollmentId });
					// if (!cancelled) setDrpFeedback(fb);
					if (!cancelled) setDrpFeedback(null);
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
				/>
			),
		}),
		[payload],
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
