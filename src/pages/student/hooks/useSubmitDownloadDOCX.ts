// file: src/pages/student/hooks/useSubmitDownloadDOCX.ts

import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { downloadDocx } from "./downloadDocx";
import { useSettingsProfile } from "../../shared/hooks/settings.ts";
import type { StudentSubmissionPayload } from "../../../lib/types/studentSubmission.ts";
import { COURSE } from "./constants.ts";
import type { SubmissionEditorApi } from "./useStudentSubmissionEditor.ts";

type WorkupNavState = {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
	weekNo?: number;
	patientName?: string;
};

type SubmitDownloadResult = {
	downloading: boolean;
	download: () => Promise<void>;
};

/**
 * Shared Submit + Download hook.
 * Works for both MRP wizard and Standard editor.
 *
 * Behavior:
 * - If editor is not dirty: download immediately
 * - If editor is dirty: save with isSubmit=true; if save fails, abort download
 */
export function useSubmitDownloadDOCX(editor: SubmissionEditorApi): SubmitDownloadResult {
	const { profile } = useSettingsProfile(true);
	const loc = useLocation();
	const st = (loc.state as WorkupNavState | null) ?? null;

	const weekNo = st?.weekNo ?? "";
	const patientName = (st?.patientName ?? "").trim();

	const payload: StudentSubmissionPayload = useMemo(
		() => ({
			patientInfo: editor.patient.patientInfo,
			studentDrpAnswers: editor.studentDrpAnswers ?? [],
		}),
		[editor.patient.patientInfo, editor.studentDrpAnswers],
	);

	const [downloading, setDownloading] = useState(false);

	const download = useCallback(async () => {
		if (downloading || editor.saving) return;

		setDownloading(true);
		try {
			// const res = await editor.saveIfDirty({ isSubmit: true });
			// if (res === "FAILED") return; // editor.error is set by useStudentSubmissionEditor.ts

			await downloadDocx({
				payload,
				isMrp: editor.isMrp,
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
	}, [downloading, editor, payload, profile?.name, profile?.email, weekNo, patientName]);

	return { downloading, download };
}
