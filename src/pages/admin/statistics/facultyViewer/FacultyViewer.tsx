// file: src/pages/admin/statistics/facultyViewer/FacultyViewer.tsx

import { useCallback, useMemo, useState } from "react";
import type { NormalizedRow } from "./types";
import {
	formatType,
	normalizeRow,
	parseJsonl,
	typeRank,
	uniqByTypeOrder,
	uniqSorted,
} from "./helpers";
import SummaryCard from "./SummaryCard";
import DiseaseNavigator from "./DiseaseNavigator";
import { titleizeDiseaseName } from "../../../../lib/utils/functions.ts";

// ── Sub-components ─────────────────────────────────────────────

function FilterLabel({ children }: { children: React.ReactNode }) {
	return (
		<label className="block text-[11px] font-medium uppercase tracking-widest text-muted mb-1.5">
			{children}
		</label>
	);
}

function StatPill({ value, label }: { value: number; label: string }) {
	return (
		<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-subtle bg-surface-subtle text-xs text-muted">
			<strong className="font-medium text-primary">{value}</strong>
			{label}
		</span>
	);
}

// ── Main component ─────────────────────────────────────────────

export default function FacultyViewer() {
	const [rows, setRows] = useState<NormalizedRow[]>([]);
	const [modeFilter, setModeFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [diseaseIdx, setDiseaseIdx] = useState(0);

	// File ingestion
	const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const text = await file.text();
		setRows(parseJsonl(text).map(normalizeRow));
		setModeFilter("");
		setTypeFilter("");
		setDiseaseIdx(0);
	}, []);

	// Filter options derived from all rows
	const allModes = useMemo(() => uniqSorted(rows.map((r) => r.mode)), [rows]);
	const allTypes = useMemo(() => uniqByTypeOrder(rows.map((r) => r.type)), [rows]);

	// Filtered set (no disease filter — handled by navigator)
	const filtered = useMemo(
		() =>
			rows.filter(
				(r) =>
					(!modeFilter || r.mode === modeFilter) &&
					(!typeFilter || r.type === typeFilter),
			),
		[rows, modeFilter, typeFilter],
	);

	// Unique diseases in filtered set, alphabetical
	const diseases = useMemo(() => uniqSorted(filtered.map((r) => r.disease_id)), [filtered]);

	// Clamp index when filters change
	const safeIdx = Math.min(diseaseIdx, Math.max(0, diseases.length - 1));
	const currentDiseaseId = diseases[safeIdx] ?? null;

	// Cards for the current disease, sorted by canonical type order
	const visibleRows = useMemo(() => {
		if (!currentDiseaseId) return [];
		return filtered
			.filter((r) => r.disease_id === currentDiseaseId)
			.slice()
			.sort((a, b) => typeRank(a.type) - typeRank(b.type));
	}, [filtered, currentDiseaseId]);

	// Stats across full filtered set
	const stats = useMemo(
		() => ({
			total: filtered.length,
			modes: uniqSorted(filtered.map((r) => r.mode)).length,
			diseases: diseases.length,
			types: uniqSorted(filtered.map((r) => r.type)).length,
		}),
		[filtered, diseases],
	);

	const handleFilterChange =
		(setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
			setter(e.target.value);
			setDiseaseIdx(0);
		};

	const selectClass =
		"w-full px-3 py-2 rounded-md border border-strong bg-surface-subtle text-sm text-primary appearance-none cursor-pointer focus-visible:outline-accent";

	return (
		<div className="space-y-4">
			{/* ── Controls panel ── */}
			<div className="rounded-lg border border-subtle bg-surface p-4">
				<div className="grid grid-cols-[2fr_1fr_1fr_auto] max-lg:grid-cols-2 max-sm:grid-cols-1 gap-3 items-end">
					{/* File input */}
					<div className="max-lg:col-span-2 max-sm:col-span-1">
						<FilterLabel>JSONL results file</FilterLabel>
						<input
							type="file"
							accept=".jsonl,.txt,.json"
							onChange={handleFile}
							className="w-full px-3 py-2 rounded-md border border-strong bg-surface-subtle text-sm text-primary cursor-pointer"
						/>
					</div>

					{/* Mode filter */}
					<div>
						<FilterLabel>Mode</FilterLabel>
						<select
							value={modeFilter}
							onChange={handleFilterChange(setModeFilter)}
							className={selectClass}
						>
							<option value="">All modes</option>
							{allModes.map((m) => (
								<option key={m} value={m}>
									{m}
								</option>
							))}
						</select>
					</div>

					{/* Type filter */}
					<div>
						<FilterLabel>Rubric section</FilterLabel>
						<select
							value={typeFilter}
							onChange={handleFilterChange(setTypeFilter)}
							className={selectClass}
						>
							<option value="">All sections</option>
							{allTypes.map((t) => (
								<option key={t} value={t}>
									{formatType(t)}
								</option>
							))}
						</select>
					</div>

					{/* Clear */}
					<div className="flex items-end">
						<button
							onClick={() => {
								setModeFilter("");
								setTypeFilter("");
								setDiseaseIdx(0);
							}}
							className="px-4 py-2 rounded-md border border-strong bg-accent text-on-accent text-sm font-medium btn-hover whitespace-nowrap"
						>
							Clear filters
						</button>
					</div>
				</div>

				{/* Stats */}
				{rows.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-3">
						<StatPill value={stats.total} label="summaries" />
						<StatPill
							value={stats.modes}
							label={stats.modes !== 1 ? "modes" : "mode"}
						/>
						<StatPill
							value={stats.diseases}
							label={stats.diseases !== 1 ? "diseases" : "disease"}
						/>
						<StatPill
							value={stats.types}
							label={stats.types !== 1 ? "rubric sections" : "rubric section"}
						/>
					</div>
				)}

				<p className="mt-2.5 text-[11px] text-muted font-mono">
					Expected: downstream_llm_results_baseline_eom.jsonl /
					downstream_llm_results_baseline_leaf.jsonl — or a combined JSONL.
				</p>
			</div>

			{/* ── Disease navigator ── */}
			{diseases.length > 0 && currentDiseaseId && (
				<DiseaseNavigator
					label={titleizeDiseaseName(currentDiseaseId)}
					current={safeIdx}
					total={diseases.length}
					onPrev={() => setDiseaseIdx((i) => Math.max(0, i - 1))}
					onNext={() => setDiseaseIdx((i) => Math.min(diseases.length - 1, i + 1))}
				/>
			)}

			{/* ── Cards ── */}
			{rows.length === 0 ? (
				<div className="rounded-lg border border-dashed border-strong bg-surface px-6 py-12 text-center text-sm text-muted">
					Load a JSONL file to get started.
				</div>
			) : visibleRows.length === 0 ? (
				<div className="rounded-lg border border-dashed border-strong bg-surface px-6 py-12 text-center text-sm text-muted">
					No summaries match the current filters.
				</div>
			) : (
				<div className="space-y-4">
					{visibleRows.map((row, i) => (
						<SummaryCard
							key={`${row.disease_id}-${row.type}-${row.mode}-${i}`}
							row={row}
						/>
					))}
				</div>
			)}
		</div>
	);
}
