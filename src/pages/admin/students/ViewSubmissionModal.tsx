// file: src/pages/admin/students/ViewSubmissionModal.tsx

import { useMemo } from "react";
import type { ViewStatus, WeeklyWorkupStudentStatus } from "../../../lib/types/studentWeeks.ts";
import { InlineNotice } from "../../shared/SharedUI.tsx";
import { ViewSubmissionPage } from "../../shared/submission/view/ViewSubmissionPage.tsx";
import { isViewOnly } from "../../student/hooks/routeToWorkup.ts";
import Modal from "../../../components/Modal.tsx";
import { WorkupStatusPill } from "../../shared/WorkupStatusPill.tsx";

type Props = {
	open: boolean;
	onClose: () => void;

	weeklyWorkupId: number;
	studentEnrollmentId: string;
	status: WeeklyWorkupStudentStatus;

	studentName: string;
};

export function ViewSubmissionModal({
	open,
	onClose,
	weeklyWorkupId,
	studentEnrollmentId,
	status,
	studentName,
}: Props) {
	const allowed = useMemo(() => isViewOnly(status), [status]);

	return (
		<Modal
			open={open}
			onClose={onClose}
			containerClassName="fixed inset-0 z-50 flex items-center justify-center"
			className="w-[80vw] h-[80vh] overflow-hidden rounded-[1.75rem]"
			title={
				<div className="min-w-0">
					<h2 className="text-sm font-semibold text-primary">View submission</h2>
					<p className="text-xs text-muted mt-1">
						<span className="font-semibold text-primary">{studentName}</span>
						<span className="mx-2 text-muted">|</span>
						<span className="font-semibold text-primary">
							<WorkupStatusPill status={status}></WorkupStatusPill>
						</span>
					</p>
				</div>
			}
		>
			<div className="h-[calc(80vh-140px)] overflow-y-auto">
				{!allowed ? (
					<InlineNotice
						tone="info"
						text="Viewing is enabled only when status is Grading or Feedback Available."
					/>
				) : (
					<div className="rounded-2xl border border-subtle bg-input p-3">
						<ViewSubmissionPage
							weeklyWorkupId={weeklyWorkupId}
							studentEnrollmentId={studentEnrollmentId}
							status={status as ViewStatus}
							embedded
							showInstructorComment
							instructorCommentEditable
						/>
					</div>
				)}
			</div>
		</Modal>
	);
}
