// file: src/pages/student/hooks/useStandardSubmissionEditor.ts

import type { StudentSubmissionQuery } from "../../../lib/types/studentSubmission";
import { type SubmissionEditorApi, useStudentSubmissionEditor, } from "./useStudentSubmissionEditor.ts";

/**
 * Standard editor adapter around the shared submission editor core.
 * No reflection, no guidance, no stepper. Same payload and endpoint as MRP.
 */
export function useStandardSubmissionEditor(q: StudentSubmissionQuery): SubmissionEditorApi {
	return useStudentSubmissionEditor(q, { isMrp: false });
}
