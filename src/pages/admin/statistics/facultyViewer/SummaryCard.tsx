// file: src/pages/admin/statistics/facultyViewer/SummaryCard.tsx

import type { NormalizedRow } from "./types";

interface Props {
	row: NormalizedRow;
}

function ItemList({ items }: { items: string[] }) {
	if (!items.length) return <p className="text-sm italic text-muted">None listed.</p>;
	return (
		<ul className="list-disc pl-4 space-y-1">
			{items.map((item, i) => (
				<li key={i} className="text-sm leading-relaxed text-primary">
					{item}
				</li>
			))}
		</ul>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="p-3.5 border-r border-subtle last:border-r-0">
			<p className="text-sm font-medium uppercase tracking-widest text-muted mb-2.5">
				{title}
			</p>
			{/* textarea-scroll comes from index.css for thin cross-browser scrollbar */}
			<div className="max-h-80 overflow-y-auto textarea-scroll">{children}</div>
		</div>
	);
}

export default function SummaryCard({ row }: Props) {
	return (
		<div className="rounded-lg border border-subtle overflow-hidden">
			{/* Card header */}
			<div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-subtle bg-accent">
				<span className="text-sm font-medium text-on-accent">{row.type_label}</span>
			</div>

			{/* Four columns */}
			<div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
				<Section title="Faculty summary">
					<p className="text-sm leading-relaxed text-primary whitespace-pre-wrap">
						{row.faculty_summary}
					</p>
				</Section>

				<Section title="Top strengths">
					<ItemList items={row.top_strengths} />
				</Section>

				<Section title="Mixed areas">
					<ItemList items={row.mixed_areas} />
				</Section>

				<Section title="Common gaps">
					<ItemList items={row.common_gaps} />
					{row.teaching_actions.length > 0 && (
						<>
							<p className="text-sm font-medium uppercase tracking-widest text-muted mt-3 pt-3 border-t border-subtle mb-2">
								Teaching actions
							</p>
							<ItemList items={row.teaching_actions} />
						</>
					)}
				</Section>
			</div>
		</div>
	);
}
