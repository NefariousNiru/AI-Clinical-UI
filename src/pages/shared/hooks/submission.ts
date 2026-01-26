// file: src/pages/shared/hooks/submission.ts

import { useEffect, useRef, useState } from "react";
import type { ViewStatus } from "../../../lib/types/studentWeeks.ts";
import type { ProblemFeedbackList } from "../../../lib/types/feedback.ts";
import {
	makeEmptyStudentSubmissionPayload,
	type StudentSubmissionPayload,
} from "../../../lib/types/studentSubmission.ts";
import {
	getStudentFeedback,
	getStudentSubmission,
	getSubmissionComment,
} from "../../../lib/api/shared/student.ts";
import { addSubmissionComment } from "../../../lib/api/admin/studentDeadlines.ts";

export function useSubmissionView(params: {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
	status: ViewStatus;
}) {
	const { weeklyWorkupId, studentEnrollmentId, status } = params;

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
			// Policy: only view in grading/feedback_available.
			if (status !== "grading" && status !== "feedback_available") return;

			setLoading(true);
			setError(null);

			if (status !== "feedback_available") {
				setDrpFeedback(null);
				setDrpFeedbackError(null);
			}

			try {
				if (status === "feedback_available") {
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

	return {
		loading,
		error,
		payload,
		drpFeedback,
		drpFeedbackError,
	};
}

export function useInstructorComment(params: {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
}) {
	const { weeklyWorkupId, studentEnrollmentId } = params;

	const [comment, setComment] = useState("");
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

	const [loading, setLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	// Prevent overwriting user edits when async prefill arrives
	const dirtyRef = useRef(false);

	useEffect(() => {
		let cancelled = false;

		setToast(null);
		setSaving(false);
		setLoadError(null);
		setLoading(true);

		dirtyRef.current = false;
		setComment("");

		async function run(): Promise<void> {
			try {
				const prev = await getSubmissionComment({
					week_id: weeklyWorkupId,
					enrollment_id: studentEnrollmentId,
				});
				if (cancelled) return;

				setLoading(false);
				setLoadError(null);

				if (!dirtyRef.current) setComment(prev ?? "");
			} catch (e: any) {
				if (cancelled) return;
				setLoading(false);
				setLoadError(e?.message ?? "Failed to load previous comment.");
			}
		}

		void run();
		return () => {
			cancelled = true;
		};
	}, [weeklyWorkupId, studentEnrollmentId]);

	function onChange(next: string) {
		dirtyRef.current = true;
		setComment(next);
	}

	async function save(): Promise<void> {
		const c = comment.trim();
		if (!c) {
			setToast({ tone: "danger", text: "Comment is required." });
			return;
		}

		setSaving(true);
		setToast(null);

		try {
			await addSubmissionComment({
				weekId: weeklyWorkupId,
				enrollmentId: studentEnrollmentId,
				comment: c,
			});
			setToast({ tone: "success", text: "Comment saved." });
		} catch (e: any) {
			setToast({ tone: "danger", text: e?.message ?? "Failed to save comment." });
		} finally {
			setSaving(false);
		}
	}

	return {
		comment,
		loading,
		loadError,

		saving,
		toast,

		onChange,
		save,
	};
}
