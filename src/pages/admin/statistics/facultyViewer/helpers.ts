// file: src/pages/admin/statistics/facultyViewer/helpers.ts

import type { LlmOutput, NormalizedRow, RawRow } from "./types";
import { titleizeDiseaseName } from "../../../../lib/utils/functions.ts";

// ── Label helpers ──────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
	identification: "Identification",
	explanation: "Explanation",
	plan_recommendation: "Plan/Recommendation",
	plan: "Plan/Recommendation",
	monitoring: "Monitoring",
};

export const TYPE_ORDER = [
	"identification",
	"explanation",
	"plan_recommendation",
	"plan",
	"monitoring",
];

export function typeRank(t: string): number {
	const idx = TYPE_ORDER.indexOf((t ?? "").toLowerCase());
	return idx === -1 ? 999 : idx;
}

export function formatType(t: string): string {
	if (!t || t === "unknown") return t;
	return (
		TYPE_LABELS[t.toLowerCase()] ??
		t
			.split("_")
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(" ")
	);
}

// ── Parsing ────────────────────────────────────────────────────

function safeJson<T>(text: string): T | null {
	try {
		return JSON.parse(text) as T;
	} catch {
		return null;
	}
}

export function parseJsonl(content: string): RawRow[] {
	return content
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean)
		.map((l) => safeJson<RawRow>(l))
		.filter((r): r is RawRow => r !== null);
}

export function normalizeRow(row: RawRow): NormalizedRow {
	const parsed: LlmOutput | null =
		typeof row.llm_output === "string"
			? safeJson<LlmOutput>(row.llm_output)
			: ((row.llm_output as LlmOutput | null) ?? null);

	const rawFallback = typeof row.llm_output === "string" ? row.llm_output : "";

	return {
		mode: row.mode ?? "unknown",
		disease_id: row.disease_id ?? "unknown",
		disease_label: titleizeDiseaseName(row.disease_id ?? "unknown"),
		type: row.type ?? "unknown",
		type_label: formatType(row.type ?? "unknown"),
		faculty_summary: parsed?.faculty_summary ?? rawFallback,
		top_strengths: parsed?.top_strengths ?? [],
		mixed_areas: parsed?.mixed_areas ?? [],
		common_gaps: parsed?.common_gaps ?? [],
		teaching_actions: parsed?.teaching_actions ?? [],
	};
}

// ── Utilities ──────────────────────────────────────────────────

export function uniqSorted(vals: string[]): string[] {
	return [...new Set(vals)].sort((a, b) => a.localeCompare(b));
}

export function uniqByTypeOrder(vals: string[]): string[] {
	return [...new Set(vals)].sort((a, b) => typeRank(a) - typeRank(b));
}
