// file: src/pages/student/submission/view/ViewSubmissionPage.tsx

import { useEffect, useMemo, useState } from "react";
import type { ViewStatus } from "../../../../lib/types/studentWeeks.ts";
import {
	makeEmptyStudentSubmissionPayload,
	type StudentSubmissionPayload,
} from "../../../../lib/types/studentSubmission.ts";
import type { TabKey } from "../../hooks/constants.ts";
import { getStudentSubmission } from "../../../../lib/api/shared/student.ts";
import PatientInfoViewTab from "./PatientInfoViewTab.tsx";
import { BackToWeeklyWorkup } from "../BackToWeeklyWorkup.tsx";
import { TabLayout } from "../TabLayout.tsx";
import LabsAndProgressViewTab from "./LabsAndProgressViewTab.tsx";
import MedicationsViewTab from "./MedicationsViewTab.tsx";
import HealthCareProblemsViewTab from "./HealthCareProblemsViewTab.tsx";

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

	useEffect(() => {
		let cancelled = false;

		async function run() {
			if (status !== "grading") return;

			setLoading(true);
			setError(null);

			try {
				const res = await getStudentSubmission({ weeklyWorkupId, studentEnrollmentId });
				if (!cancelled) setPayload(res);
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
			patient: <PatientInfoViewTab patientInfo={payload.patientInfo} />,
			labs: <LabsAndProgressViewTab patientInfo={payload.patientInfo} />,
			meds: <MedicationsViewTab patientInfo={payload.patientInfo} />,
			drp: <HealthCareProblemsViewTab items={payload.studentDrpAnswers} />,
		}),
		[payload],
	);

	if (status === "feedback_available") {
		// Placeholder until feedback API exists
		return (
			<div className="mx-auto w-full max-w-4xl">
				<div className="mb-6">
					<BackToWeeklyWorkup />
				</div>
				<div className="rounded-xl border border-subtle app-bg p-5">
					<div className="text-sm font-semibold text-primary">
						Feedback viewer not implemented
					</div>
					<div className="mt-1 text-sm text-muted">
						This workup is in feedback_available state. Hook up the feedback API here.
					</div>
				</div>
			</div>
		);
	}

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
