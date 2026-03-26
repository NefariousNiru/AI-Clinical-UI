// file: src/pages/shared/submission/view/HealthCareProblemViewTab.tsx

import { useState } from "react";
import type { StudentDrpAnswer } from "../../../../lib/types/studentSubmission.ts";
import type { ProblemFeedbackList } from "../../../../lib/types/feedback.ts";
import { isAnySectionMeaningful, ValueBox } from "./ViewComponents.tsx";
import ProblemFeedbackView from "../../feedback/ProblemFeedbackView.tsx";
import type { ViewStatus } from "../../../../lib/types/studentWeeks.ts";
import { titleizeDiseaseName } from "../../../../lib/utils/functions.ts";
import { ChevronDown } from "lucide-react";

function isDrpMeaningful(i: StudentDrpAnswer) {
	return isAnySectionMeaningful([
		i.name,
		i.identification,
		i.explanation,
		i.planRecommendation,
		i.monitoring,
	]);
}

function displayProblemName(name: string) {
	const raw = (name ?? "").trim();
	if (!raw) return "Health Care Problem";
	return titleizeDiseaseName(raw); // display only
}

function toKey(name: string) {
	return (name ?? "").trim().toLowerCase(); // match key only (no titleize)
}

function DrpTile({ idx, item }: { idx: number; item: StudentDrpAnswer }) {
	const [open, setOpen] = useState(false);

	const sections = [
		{ label: "Identification", value: item.identification },
		{ label: "Explanation", value: item.explanation },
		{ label: "Plan / Recommendation", value: item.planRecommendation },
		{ label: "Monitoring", value: item.monitoring },
	].filter((s) => isAnySectionMeaningful([s.value]));

	if (!isAnySectionMeaningful([item.name]) && sections.length === 0) return null;

	const title = `${idx + 1}. ${displayProblemName(item.name)}`;

	return (
		<article className="rounded-2xl border border-subtle overflow-hidden app-bg">
			<header className="flex items-center justify-between border-b border-subtle px-4 py-3">
				<div className="min-w-0 flex-1">
					<h2 className="text-sm font-semibold text-on-accent-soft truncate">{title}</h2>
				</div>

				<div className="ml-3 flex items-center gap-2">
					{item.isPriority ? (
						<span className="inline-flex items-center rounded-md bg-secondary px-3 m-2 py-0.5 text-xs font-medium text-on-secondary">
							Priority
						</span>
					) : null}

					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-subtle bg-surface hover:bg-accent-soft transition-colors"
						aria-label={open ? "Collapse problem" : "Expand problem"}
					>
						<ChevronDown
							className={[
								"h-4 w-4 text-muted transition-transform duration-150",
								open ? "rotate-180" : "rotate-0",
							].join(" ")}
						/>
					</button>
				</div>
			</header>

			{open ? (
				<div className="p-4 space-y-5">
					{sections.map((s) => (
						<ValueBox key={s.label} label={s.label} value={s.value} />
					))}
				</div>
			) : null}
		</article>
	);
}

function SubmittedNoFeedback({ items }: { items: StudentDrpAnswer[] }) {
	const visible = items.filter(isDrpMeaningful);
	if (visible.length === 0) return null;

	return (
		<div className="space-y-4">
			<div className="text-sm font-semibold text-primary">Submitted (no feedback yet)</div>
			<div className="space-y-4">
				{visible.map((it, idx) => (
					<DrpTile key={`${toKey(it.name)}-${idx}`} idx={idx} item={it} />
				))}
			</div>
		</div>
	);
}

export default function HealthCareProblemViewTab({
	mode,
	items,
	feedback,
	feedbackError,
}: {
	mode: ViewStatus;
	items: StudentDrpAnswer[];
	feedback?: ProblemFeedbackList | null;
	feedbackError?: string | null;
}) {
	const visibleItems = items.filter(isDrpMeaningful);

	if (mode === "feedback_available") {
		// If feedback fetch failed, show banner but still allow viewing submission
		if (feedbackError) {
			return (
				<div className="space-y-6">
					<div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
						{feedbackError}
					</div>

					{visibleItems.length === 0 ? (
						<div className="rounded-xl border border-subtle app-bg p-5">
							<div className="text-sm text-muted">
								No health care problems were submitted.
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{visibleItems.map((it, idx) => (
								<DrpTile key={`${toKey(it.name)}-${idx}`} idx={idx} item={it} />
							))}
						</div>
					)}
				</div>
			);
		}

		// Feedback missing/empty, still show submission
		if (!feedback || feedback.length === 0) {
			if (visibleItems.length === 0) {
				return (
					<div className="rounded-xl border border-subtle app-bg p-5">
						<div className="text-sm text-muted">
							No health care problems were submitted.
						</div>
					</div>
				);
			}

			return (
				<div className="space-y-6">
					<div className="rounded-xl border border-subtle app-bg p-5">
						<div className="text-sm font-semibold text-primary">
							Feedback not available
						</div>
						<div className="mt-1 text-sm text-muted">
							Feedback is not loaded yet. Showing submitted answers.
						</div>
					</div>

					<div className="space-y-4">
						{visibleItems.map((it, idx) => (
							<DrpTile key={`${toKey(it.name)}-${idx}`} idx={idx} item={it} />
						))}
					</div>
				</div>
			);
		}

		// Show feedback + any submitted items that didn't receive feedback
		const feedbackKeys = new Set(feedback.map((f) => toKey(f.name)));
		const unmatched = visibleItems.filter((s) => !feedbackKeys.has(toKey(s.name)));

		return (
			<div className="space-y-6">
				<ProblemFeedbackView data={feedback} studentProblems={items} />
				<SubmittedNoFeedback items={unmatched} />
			</div>
		);
	}

	// grading mode
	if (visibleItems.length === 0) {
		return (
			<div className="rounded-xl border border-subtle app-bg p-5">
				<div className="text-sm text-muted">No health care problems were submitted.</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{visibleItems.map((it, idx) => (
				<DrpTile key={`${toKey(it.name)}-${idx}`} idx={idx} item={it} />
			))}
		</div>
	);
}
