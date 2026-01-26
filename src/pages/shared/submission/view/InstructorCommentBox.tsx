// file: src/pages/shared/submission/view/InstructorCommentBox.tsx

import { btnPrimary, InlineNotice } from "../../SharedUI.tsx";
import { useInstructorComment } from "../../hooks/submission.ts";

type Props = {
	weeklyWorkupId: number;
	studentEnrollmentId: string;
	editable: boolean;
};

export function InstructorCommentBox({ weeklyWorkupId, studentEnrollmentId, editable }: Props) {
	const { comment, onChange, loading, loadError, saving, toast, save } = useInstructorComment({
		weeklyWorkupId,
		studentEnrollmentId,
	});

	return (
		<section className="rounded-2xl bg-surface-subtle p-4 border border-subtle">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<h3 className="text-xs font-semibold text-primary">Instructor comment</h3>
				</div>

				{editable ? (
					<button
						type="button"
						onClick={() => void save()}
						disabled={saving}
						className={[
							btnPrimary,
							"disabled:opacity-60 disabled:cursor-not-allowed",
						].join(" ")}
					>
						{saving ? "Saving..." : "Save"}
					</button>
				) : null}
			</div>

			<div className="mt-2">
				{loading ? (
					<p className="text-[11px] text-muted">Loading previous comment...</p>
				) : loadError ? (
					<InlineNotice tone="danger" text={loadError} />
				) : null}
			</div>

			<textarea
				value={comment}
				onChange={(e) => onChange(e.target.value)}
				rows={4}
				disabled={!editable}
				className={[
					"mt-3 w-full rounded-2xl border border-subtle bg-input px-3 py-2 text-xs text-primary",
					"focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent",
					"disabled:opacity-60 disabled:cursor-not-allowed",
				].join(" ")}
				placeholder={
					editable ? "Add remarks for this submission..." : "No instructor comment."
				}
			/>

			{toast ? (
				<div className="mt-3">
					<InlineNotice tone={toast.tone} text={toast.text} />
				</div>
			) : null}
		</section>
	);
}
