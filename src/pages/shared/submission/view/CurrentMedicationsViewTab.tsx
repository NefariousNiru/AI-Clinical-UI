// file: src/pages/shared/submission/view/CurrentMedicationsViewTab.tsx

import type { MedicationHistory, MedicationList } from "../../../../lib/types/studentSubmission.ts";
import {
	MEDICATION_HISTORY_FIELDS,
	MEDICATION_LIST_FIELDS,
} from "../../../student/hooks/constants.ts";
import {
	isAnySectionMeaningful,
	type Limit,
	ReflectionSection,
	ValueBox,
} from "./ViewComponents.tsx";

function getMedicationMetaEntries(medicationList: MedicationList) {
	const spec = MEDICATION_LIST_FIELDS.fields as Record<string, { label: string; limit?: Limit }>;

	return Object.keys(spec)
		.filter((k) => k !== "medications" && k !== "reflectionAnswers")
		.map((k) => ({
			key: k,
			label: spec[k]?.label ?? k,
			limit: spec[k]?.limit,
			value: (medicationList as any)[k],
		}))
		.filter((e) => isAnySectionMeaningful([e.value]));
}

function getVisibleMedicationRows(rows: MedicationHistory[]) {
	return rows.filter((r) => isAnySectionMeaningful([r.scheduledStartStopDate, r.prn]));
}

function MedicationsTable({ rows }: { rows: MedicationHistory[] }) {
	const visible = getVisibleMedicationRows(rows);
	if (visible.length === 0) return null;

	const scheduledLabel = MEDICATION_HISTORY_FIELDS.fields.scheduledStartStopDate.label;
	const prnLabel = MEDICATION_HISTORY_FIELDS.fields.prn.label;

	return (
		<div className="mt-4 overflow-x-auto">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="text-left text-muted">
						<th className="py-2 pr-4">{scheduledLabel}</th>
						<th className="py-2">{prnLabel}</th>
					</tr>
				</thead>
				<tbody>
					{visible.map((r, idx) => (
						<tr key={idx} className="border-t border-subtle">
							<td className="py-3 pr-4 text-primary">
								{isAnySectionMeaningful([r.scheduledStartStopDate])
									? String(r.scheduledStartStopDate)
									: "-"}
							</td>
							<td className="py-3 text-primary">
								{isAnySectionMeaningful([r.prn]) ? String(r.prn) : "-"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default function CurrentMedicationsViewTab({
	medicationList,
}: {
	medicationList: MedicationList;
}) {
	const visibleRows = getVisibleMedicationRows(medicationList.medications);
	const metaEntries = getMedicationMetaEntries(medicationList);

	const hasReflection = isAnySectionMeaningful(
		Object.values(medicationList.reflectionAnswers ?? {}),
	);
	const hasAnything = visibleRows.length > 0 || metaEntries.length > 0 || hasReflection;

	if (!hasAnything) {
		return (
			<div className="rounded-xl border border-subtle app-bg p-5">
				<div className="text-sm text-muted">No medications were submitted.</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* One umbrella section for everything in MedicationList */}
			<div className="rounded-xl border border-subtle app-bg p-5">
				<div className="text-sm font-semibold text-primary">
					{MEDICATION_LIST_FIELDS.title}
				</div>

				{visibleRows.length > 0 ? (
					<MedicationsTable rows={medicationList.medications} />
				) : null}

				{metaEntries.length > 0 ? (
					<div className={visibleRows.length > 0 ? "mt-6 space-y-5" : "mt-4 space-y-5"}>
						{metaEntries.map((e) => (
							<ValueBox key={e.key} label={e.label} value={e.value} limit={e.limit} />
						))}
					</div>
				) : null}
			</div>

			<ReflectionSection reflectionAnswers={medicationList.reflectionAnswers} />
		</div>
	);
}
