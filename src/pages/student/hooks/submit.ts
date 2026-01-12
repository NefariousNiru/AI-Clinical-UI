// file: src/pages/student/hooks/submit.ts

import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { downloadMrpDocx } from "./downloadDocx";
import { useSettingsProfile } from "../../shared/hooks/settings.ts";
import type { StudentSubmissionPayload } from "../../../lib/types/studentSubmission.ts";
import { COURSE } from "./constants.ts";

type WorkupNavState = {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
	weekNo?: number;
	patientName?: string;
};

export function useMrpSubmit(mrp: any) {
	const { profile } = useSettingsProfile(true);
	const loc = useLocation();
	const st = (loc.state as WorkupNavState | null) ?? null;

	const weekNo = st?.weekNo ?? "";
	const patientName = (st?.patientName ?? "").trim();

	const payload: StudentSubmissionPayload = useMemo(
		() => ({
			patientInfo: mrp.patient.patientInfo,
			studentDrpAnswers: mrp.studentDrpAnswers ?? [],
		}),
		[mrp.patient.patientInfo, mrp.studentDrpAnswers],
	);

	const [downloading, setDownloading] = useState(false);

	const download = useCallback(async () => {
		if (downloading || mrp.saving) return;

		setDownloading(true);
		try {
			// Requirement:
			// - if not dirty: allow download immediately
			// - if dirty: force save; if save fails, abort download
			if (mrp.isDirty) {
				const ok = await mrp.saveIfDirty();
				if (!ok) return; // hook sets mrp.error already
			}

			await downloadMrpDocx({
				payload,
				cover: {
					course: COURSE,
					studentName: profile?.name ?? "",
					studentEmail: profile?.email ?? "",
					weekNo: String(weekNo ?? ""),
					patientName: patientName,
				},
			});
		} finally {
			setDownloading(false);
		}
	}, [downloading, mrp, payload, profile?.name, profile?.email, weekNo, patientName]);

	return {
		downloading,
		download,
	};
}
