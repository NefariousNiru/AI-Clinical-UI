// file: src/pages/student/hooks/submit.ts

import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { downloadMrpDocx } from "./downloadDocx";
import { useSettingsProfile } from "../../shared/hooks/settings.ts";
import type { StudentSubmissionPayload } from "../../../lib/types/studentSubmission.ts";

type WorkupNavState = {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
	weekNo?: number;
	patientName?: string;
};

const COURSE = "PHRM 5560: Integrated Patient Cases";
const COURSE_CODE_FOR_FILENAME = "PHRM5560";

function pad2(n: number) {
	return String(n).padStart(2, "0");
}

function formatTimestamp24h(d: Date): string {
	// YYYY-MM-DD_HH-mm (24h)
	const yyyy = d.getFullYear();
	const mm = pad2(d.getMonth() + 1);
	const dd = pad2(d.getDate());
	const hh = pad2(d.getHours());
	const mi = pad2(d.getMinutes());
	return `${yyyy}-${mm}-${dd}_${hh}-${mi}`;
}

function slugPart(s: string): string {
	// keep it filename-safe and predictable
	return s
		.trim()
		.replace(/\s+/g, "_")
		.replace(/[^A-Za-z0-9_]+/g, "")
		.replace(/_+/g, "_")
		.replace(/^_+|_+$/g, "");
}

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

	const fileName = useMemo(() => {
		const student = slugPart(profile?.name ?? "student");
		const patient = slugPart(patientName || "patient");
		const ts = formatTimestamp24h(new Date());
		return `${COURSE_CODE_FOR_FILENAME}_${student}_${patient}_${ts}.docx`;
	}, [profile?.name, patientName]);

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
	}, [downloading, mrp, payload, profile?.name, profile?.email, weekNo, patientName, fileName]);

	return {
		downloading,
		download,
	};
}
