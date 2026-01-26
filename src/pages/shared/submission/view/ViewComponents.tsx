// file: src/pages/shared/submission/view/ViewComponents.tsx

import { hasAnyMeaningfulValue } from "../../../student/hooks/useMrpToolSubmissionEditor.ts";
import { REFLECTION_ANSWER_FIELDS } from "../../../student/hooks/constants.ts";
import { useMemo } from "react";
import { useReflectionQuestions } from "../../hooks/useReflectionQuestions.ts";

export type Limit = "xSmall" | "small" | "medium" | "large";

function limitToMaxHeight(limit?: Limit) {
	// Hard cap for very long content, with scroll - avoids a single field taking the whole page.
	switch (limit) {
		case "xSmall":
			return "max-h-24";
		case "small":
			return "max-h-40";
		case "medium":
			return "max-h-64";
		case "large":
			return "max-h-80";
		default:
			return "max-h-40";
	}
}

function valueDensityClass(value: string) {
	// Adaptive sizing:
	// - Short values: compact padding, no forced height
	// - Medium: normal padding
	// - Very long: keep padding but allow scrolling (handled by max-h)
	const len = value.trim().length;
	if (len <= 40) return "py-2";
	if (len <= 220) return "py-3";
	return "py-3";
}

export function ValueBox({
	label,
	value,
	limit,
}: {
	label: string;
	value: unknown;
	limit?: Limit;
}) {
	if (!hasAnyMeaningfulValue(value)) return null;

	const text = String(value);
	return (
		<div>
			<div className="text-xs text-muted">{label}</div>
			<div
				className={[
					"mt-2 rounded-lg bg-surface-subtle px-4 text-sm text-primary whitespace-pre-wrap",
					valueDensityClass(text),
					limitToMaxHeight(limit),
					// only scroll if needed (max height triggers)
					"overflow-auto",
				].join(" ")}
			>
				{text}
			</div>
		</div>
	);
}

export function FieldGridSection<T extends Record<string, any>>({
	title,
	fieldsSpec,
	data,
}: {
	title: string;
	fieldsSpec: { fields: Record<keyof T & string, { label: string; limit?: Limit }> };
	data: T;
}) {
	const entries = Object.entries(fieldsSpec.fields).map(([key, spec]) => ({
		key,
		label: spec.label,
		limit: spec.limit,
		value: (data as any)[key],
	}));

	const visible = entries.filter((e) => hasAnyMeaningfulValue(e.value));
	if (visible.length === 0) return null;

	return (
		<div className="rounded-xl border border-subtle app-bg p-5">
			<div className="text-sm font-semibold text-primary">{title}</div>

			<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{visible.map((e) => (
					<ValueBox key={e.key} label={e.label} value={e.value} limit={e.limit} />
				))}
			</div>
		</div>
	);
}

export function LongFieldSection<T extends Record<string, any>>({
	title,
	fieldsSpec,
	data,
}: {
	title: string;
	fieldsSpec: {
		fields: Record<keyof T & string, { label: string; limit?: Limit; multiline?: boolean }>;
	};
	data: T;
}) {
	const entries = Object.entries(fieldsSpec.fields).map(([key, spec]) => ({
		key,
		label: spec.label,
		limit: spec.limit,
		value: (data as any)[key],
	}));

	const visible = entries.filter((e) => hasAnyMeaningfulValue(e.value));
	if (visible.length === 0) return null;

	return (
		<div className="rounded-xl border border-subtle app-bg p-5">
			<div className="text-sm font-semibold text-primary">{title}</div>

			<div className="mt-4 space-y-5">
				{visible.map((e) => (
					<ValueBox key={e.key} label={e.label} value={e.value} limit={e.limit} />
				))}
			</div>
		</div>
	);
}

export function ReflectionSection({
	reflectionAnswers,
	step,
}: {
	reflectionAnswers: Record<string, string> | undefined;
	step: number;
}) {
	const { questions, orderedQuestionKeys } = useReflectionQuestions(step);

	const answerEntries = useMemo(() => {
		if (!reflectionAnswers) return [];

		// We want ordering based on questions first.
		// If backend questions missing some keys, still render answer-only keys after.
		const qKeys = orderedQuestionKeys;
		const aKeys = Object.keys(reflectionAnswers);

		const orderedKeys = [...qKeys, ...aKeys.filter((k) => !qKeys.includes(k))];

		// de-dupe + keep meaningful answers only
		const seen = new Set<string>();
		return orderedKeys
			.filter((k) => {
				if (seen.has(k)) return false;
				seen.add(k);
				return hasAnyMeaningfulValue(reflectionAnswers[k]);
			})
			.map((k) => ({
				key: k,
				question: questions[k],
				answer: reflectionAnswers[k],
			}));
	}, [reflectionAnswers, orderedQuestionKeys, questions]);

	if (!reflectionAnswers) return null;
	if (answerEntries.length === 0) return null;

	const labelFor = (k: string, q?: string) => {
		const n = Number(k);
		const prefix = !Number.isNaN(n) ? `Q${n}` : k;
		return q && q.trim().length > 0 ? `${prefix}: ${q}` : prefix;
	};

	return (
		<div className="mt-5 rounded-lg border border-subtle bg-surface px-4 py-4">
			<div className="text-sm font-semibold text-primary">Reflection</div>

			<div className="mt-3 space-y-4">
				{answerEntries.map((e) => (
					<ValueBox
						key={e.key}
						label={labelFor(e.key, e.question)}
						value={e.answer}
						limit={REFLECTION_ANSWER_FIELDS.limit as Limit}
					/>
				))}
			</div>
		</div>
	);
}

export function isAnySectionMeaningful(sections: unknown[]): boolean {
	return sections.some((s) => hasAnyMeaningfulValue(s));
}
