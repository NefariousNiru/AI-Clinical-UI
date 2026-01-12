// file: src/pages/student/submission/WeeklyWorkup.tsx

import { Navigate, useLocation } from "react-router-dom";
import { useMrpToolStatus } from "../../shared/hooks/mrpToolStatus.ts";
import type { WeeklyWorkupStudentStatus } from "../../../lib/types/studentWeeks";
import MrpToolPage from "./edit/mrpTool/MrpToolPage.tsx";
import { STUDENT } from "../../../routes.ts";
import { StandardSubmissionPage } from "./edit/standard/StandardSubmissionPage.tsx";

type WeeklyWorkupRouteState = {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
	weekNo: number;
	patientName: string;
	status: WeeklyWorkupStudentStatus;
};

export type StudentSubmissionState = {
	weeklyWorkupId: number;
	studentEnrollmentId: string; // UUID
};

function isWeeklyWorkupRouteState(x: any): x is WeeklyWorkupRouteState {
	return (
		x &&
		typeof x.weeklyWorkupId === "number" &&
		typeof x.studentEnrollmentId === "string" &&
		typeof x.weekNo === "number" &&
		typeof x.patientName === "string" &&
		typeof x.status === "string"
	);
}

function isEditable(status: WeeklyWorkupStudentStatus): boolean {
	return status === "available" || status === "in_progress" || status === "submitted";
}

function isViewOnly(status: WeeklyWorkupStudentStatus): boolean {
	return status === "grading" || status === "feedback_available";
}

/**
 * This function is called by WeeklyWorkupList using a `nav` navigator <br>
 * **The navigator must pass a state of type `WeeklyWorkupRouteState`** <br>
 * See function `routeToWorkup` in `WeeklyWorkupList.tsx`
 */
export default function WeeklyWorkup() {
	const loc = useLocation();
	const { enabled: mrpEnabled, loading: mrpCheckLoading } = useMrpToolStatus();

	// state will survive refreshes in modern browsers (year 2012+)
	const state = loc.state;
	// If state is not right return back to student
	if (!isWeeklyWorkupRouteState(state)) return <Navigate to={STUDENT} replace />;

	// The state.status is view only
	if (isViewOnly(state.status)) {
		// TODO: build viewer (grading / feedback available)
		console.log("TODO: WeeklyWorkup viewer", { state });
		return (
			<div className="mx-auto w-full max-w-4xl">
				<div className="rounded-xl border border-subtle app-bg p-5">
					<div className="text-sm font-semibold text-primary">Viewer not implemented</div>
					<div className="mt-1 text-sm text-muted">
						This workup is in a view-only state ({state.status}).
					</div>
				</div>
			</div>
		);
	}

	// The state.status is editable
	if (isEditable(state.status)) {
		if (mrpCheckLoading) {
			return (
				<div className="mx-auto w-full max-w-4xl">
					<div className="rounded-xl border border-subtle app-bg p-5">
						<div className="text-sm font-semibold text-primary">Loading workup...</div>
						<div className="mt-1 text-sm text-muted">Preparing your editor.</div>
					</div>
				</div>
			);
		}

		return mrpEnabled ? (
			<MrpToolPage
				weeklyWorkupId={state.weeklyWorkupId}
				studentEnrollmentId={state.studentEnrollmentId}
			/>
		) : (
			<StandardSubmissionPage
				weeklyWorkupId={state.weeklyWorkupId}
				studentEnrollmentId={state.studentEnrollmentId}
			/>
		);
	}
}
