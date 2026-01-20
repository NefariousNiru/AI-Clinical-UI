// file: src/pages/shared/feedback/ProblemFeedbackView.tsx

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { titleizeDiseaseName } from "../../../lib/utils/functions.ts";
import type {
	DrugRelatedProblem,
	FeedbackSection,
	ProblemFeedback,
	ProblemFeedbackList,
} from "../../../lib/types/feedback.ts";

type StudentAnswerProps = {
	label: string;
	value?: string | null;
};

function StudentAnswer({ label, value }: StudentAnswerProps) {
	const v = (typeof value === "string" ? value : "").trim();
	if (!v) return null;

	return (
		<section className="mb-3 rounded-xl border border-subtle bg-secondary-soft p-3">
			<h4 className="mb-1 text-xs font-semibold text-primary">{label}</h4>
			<pre className="whitespace-pre-wrap text-sm text-primary">{v}</pre>
		</section>
	);
}

type SectionProps = {
	label: string;
	studentAnswer?: string | null;
	sec?: FeedbackSection;
};

function Section({ label, studentAnswer, sec }: SectionProps) {
	const score = typeof sec?.score === "string" ? sec.score.trim() : "";
	const evaluation = typeof sec?.evaluation === "string" ? sec.evaluation.trim() : "";
	const feedback = typeof sec?.feedback === "string" ? sec.feedback.trim() : "";

	return (
		<section className="app-bg p-3 rounded-xl border border-subtle">
			<header className="mb-2 flex items-center justify-between gap-2">
				<h3 className="text-sm font-medium text-primary">{label}</h3>
				{score && (
					<span className="inline-flex items-center rounded-4xl border border-subtle bg-secondary px-2 py-0.5 text-xs font-medium text-on-secondary">
						Score: <span className="ml-1 text-on-secondary">{score}</span>
					</span>
				)}
			</header>

			<StudentAnswer label="Student answer" value={studentAnswer} />

			{evaluation && (
				<p className="mb-2 text-sm text-primary whitespace-pre-wrap">
					<span className="font-semibold">Evaluation:</span>
					<br />
					{evaluation}
				</p>
			)}

			{feedback && (
				<p className="text-sm text-primary whitespace-pre-wrap">
					<span className="font-semibold">Feedback:</span>
					<br />
					{feedback}
				</p>
			)}
		</section>
	);
}

type ProblemTileProps = {
	idx: number;
	feedback: ProblemFeedback;
	studentProblem?: DrugRelatedProblem;
};

// Helper: extract first numeric token from an LLM score string
function extractNumericScore(sec?: FeedbackSection): number | null {
	const raw = typeof sec?.score === "string" ? sec.score.trim() : "";
	if (!raw) return null;

	// Find first number-like token: 4, 4.0, -3.25, etc
	const match = raw.match(/-?\d+(?:\.\d+)?/);
	if (!match) return null;

	const value = Number.parseFloat(match[0]);
	if (!Number.isFinite(value)) return null;

	return value;
}

// Helper: normalized display string "4.0", "56.5", etc
function normalizedScoreString(sec?: FeedbackSection): string | null {
	const value = extractNumericScore(sec);
	if (value == null) return null;
	return value.toFixed(1); // always 1 decimal place
}

function scoreLabel(label: string, sec?: FeedbackSection): string | null {
	const normalized = normalizedScoreString(sec);
	if (!normalized) return null;
	return `${label}: ${normalized}`;
}

function scoreSummary(p: ProblemFeedback): string {
	const parts: string[] = [];
	let total = 0;
	let count = 0;

	// Per-section labels, normalized
	const id = scoreLabel("Identification", p.identification);
	if (id) {
		parts.push(id);
		const v = extractNumericScore(p.identification);
		if (v != null) {
			total += v;
			count += 1;
		}
	}

	const ex = scoreLabel("Explanation", p.explanation);
	if (ex) {
		parts.push(ex);
		const v = extractNumericScore(p.explanation);
		if (v != null) {
			total += v;
			count += 1;
		}
	}

	const plan = scoreLabel("Plan & Recommendation", p.planRecommendation);
	if (plan) {
		parts.push(plan);
		const v = extractNumericScore(p.planRecommendation);
		if (v != null) {
			total += v;
			count += 1;
		}
	}

	const mon = scoreLabel("Monitoring", p.monitoring);
	if (mon) {
		parts.push(mon);
		const v = extractNumericScore(p.monitoring);
		if (v != null) {
			total += v;
			count += 1;
		}
	}

	// Total, if we had at least one valid numeric score
	if (count > 0) {
		const totalStr = total.toFixed(1); // one decimal place
		parts.push(`Total: ${totalStr}`);
	}

	return parts.join(" | ");
}

function ProblemTile({ idx, feedback, studentProblem }: ProblemTileProps) {
	const [open, setOpen] = useState(false); // all start collapsed
	const problemName = typeof feedback.name === "string" ? feedback.name : `Problem ${idx + 1}`;
	const title = `${idx + 1}. ${titleizeDiseaseName(problemName)}`;
	const summary = scoreSummary(feedback);

	return (
		<article
			className="rounded-2xl border border-subtle overflow-hidden app-bg"
			aria-label={`Feedback for ${titleizeDiseaseName(problemName)}`}
		>
			{/* Header */}
			<header className="flex items-center justify-between border-b border-subtle px-4 py-3">
				<div className="min-w-0 flex-1">
					<h2 className="text-sm font-semibold text-on-accent-soft truncate">{title}</h2>
					{summary && <p className="mt-0.5 text-[11px] text-muted truncate">{summary}</p>}
				</div>

				<div className="ml-3 flex items-center gap-2">
					{feedback.isPriority && (
						<span className="inline-flex items-center rounded-md bg-secondary px-3 m-2 py-0.5 text-xs font-medium text-on-secondary">
							Priority
						</span>
					)}

					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-subtle bg-surface hover:bg-accent-soft transition-colors"
						aria-label={open ? "Collapse feedback" : "Expand feedback"}
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

			{/* Collapsible body */}
			{open && (
				<div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
					<Section
						label="Identification"
						studentAnswer={studentProblem?.identification}
						sec={feedback.identification}
					/>
					<Section
						label="Explanation"
						studentAnswer={studentProblem?.explanation}
						sec={feedback.explanation}
					/>
					<Section
						label="Plan & Recommendation"
						studentAnswer={studentProblem?.planRecommendation}
						sec={feedback.planRecommendation}
					/>
					<Section
						label="Monitoring"
						studentAnswer={studentProblem?.monitoring}
						sec={feedback.monitoring}
					/>
				</div>
			)}
		</article>
	);
}

type ProblemFeedbackViewProps = {
	data: ProblemFeedbackList;
	/** Student DRP answers to surface alongside feedback */
	studentProblems?: DrugRelatedProblem[] | null;
};

export default function ProblemFeedbackView({ data, studentProblems }: ProblemFeedbackViewProps) {
	if (!Array.isArray(data) || data.length === 0) {
		return (
			<p className="text-sm text-muted" aria-live="polite">
				No feedback.
			</p>
		);
	}

	// Build a lookup from problem.name -> student problem (no casts)
	const byProblem: Record<string, DrugRelatedProblem> = {};
	if (Array.isArray(studentProblems)) {
		for (const p of studentProblems) {
			if (p && typeof p.name === "string" && p.name.trim()) byProblem[p.name] = p;
		}
	}

	return (
		<div className="space-y-4">
			{data.map((p: ProblemFeedback, idx: number) => {
				const problemName = typeof p.name === "string" ? p.name : `Problem ${idx + 1}`;
				const stu = byProblem[problemName];

				return (
					<ProblemTile
						key={problemName || idx}
						idx={idx}
						feedback={p}
						studentProblem={stu}
					/>
				);
			})}
		</div>
	);
}
