// file: src/pages/student/submission/view/standard/tabs/HealthCareProblemsViewTab.tsx

import type { StudentDrpAnswer } from "../../../../lib/types/studentSubmission";
import { hasAnyMeaningfulValue } from "../../hooks/useMrpToolSubmissionEditor.ts";

function DrpCard({ item }: { item: StudentDrpAnswer }) {
	const sections = [
		{ label: "Identification", value: item.identification },
		{ label: "Explanation", value: item.explanation },
		{ label: "Plan / Recommendation", value: item.planRecommendation },
		{ label: "Monitoring", value: item.monitoring },
	].filter((s) => hasAnyMeaningfulValue(s.value));

	if (!hasAnyMeaningfulValue(item.name) && sections.length === 0) return null;

	return (
		<div className="rounded-xl border border-subtle app-bg p-5">
			<div className="flex items-center justify-between gap-3">
				<div className="text-sm font-semibold text-primary">
					{item.name || "Health Care Problem"}
				</div>
				{item.isPriority ? (
					<div className="rounded-full bg-accent px-2 py-0.5 text-xs text-on-accent">
						Priority
					</div>
				) : null}
			</div>

			<div className="mt-4 space-y-4">
				{sections.map((s) => (
					<div key={s.label}>
						<div className="text-xs text-muted">{s.label}</div>
						<div className="mt-1 rounded-lg bg-surface-subtle px-4 py-3 text-sm text-primary">
							{String(s.value)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function HealthCareProblemsViewTab({ items }: { items: StudentDrpAnswer[] }) {
	const visible = items.filter(
		(i) =>
			hasAnyMeaningfulValue(i.name) ||
			hasAnyMeaningfulValue(i.identification) ||
			hasAnyMeaningfulValue(i.explanation) ||
			hasAnyMeaningfulValue(i.planRecommendation) ||
			hasAnyMeaningfulValue(i.monitoring),
	);

	if (visible.length === 0) {
		return (
			<div className="rounded-xl border border-subtle app-bg p-5">
				<div className="text-sm text-muted">No health care problems were submitted.</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{visible.map((it, idx) => (
				<DrpCard key={idx} item={it} />
			))}
		</div>
	);
}
