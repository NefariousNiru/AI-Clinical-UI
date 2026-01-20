// file: src/pages/student/submission/view/ViewComponents.tsx

import { hasAnyMeaningfulValue } from "../../hooks/useMrpToolSubmissionEditor";
import { REFLECTION_ANSWER_FIELDS } from "../../hooks/constants";

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
}: {
	reflectionAnswers: Record<string, string> | undefined;
}) {
	if (!reflectionAnswers) return null;

	const entries = Object.entries(reflectionAnswers).filter(([, v]) => hasAnyMeaningfulValue(v));
	if (entries.length === 0) return null;

	const formatKey = (k: string) => {
		const n = Number(k);
		if (!Number.isNaN(n)) return `Q${n}`;
		return k;
	};

	return (
		<div className="mt-5 rounded-lg border border-subtle bg-surface px-4 py-4">
			<div className="text-sm font-semibold text-primary">Reflection</div>

			<div className="mt-3 space-y-4">
				{entries.map(([k, v]) => (
					<ValueBox
						key={k}
						label={formatKey(k)}
						value={v}
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
