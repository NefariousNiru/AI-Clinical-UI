// file: src/pages/student/submission/view/standard/tabs/MedicationsViewTab.tsx

import type { MedicationHistory, PatientInfo } from "../../../../lib/types/studentSubmission";
import { hasAnyMeaningfulValue } from "../../hooks/useMrpToolSubmissionEditor.ts";

// TODO: import these labels from your constants file
const MED_EXTRA_LABELS: Record<string, string> = {
	sup: "SUP",
	vtePpx: "VTE Prophylaxis",
	bowelRegimen: "Bowel Regimen",
	ivAccessLineTubes: "IV Access / Lines / Tubes",
	otcCam: "OTC / CAM",
	medicationAdherence: "Medication Adherence",
};

function TextBlock({ label, value }: { label: string; value: unknown }) {
	if (!hasAnyMeaningfulValue(value)) return null;
	return (
		<div>
			<div className="text-sm font-semibold text-primary">{label}</div>
			<div className="mt-2 rounded-lg bg-surface-subtle px-4 py-3 text-sm text-primary">
				{String(value)}
			</div>
		</div>
	);
}

function MedTable({ rows }: { rows: MedicationHistory[] }) {
	const visible = rows.filter(
		(r) => hasAnyMeaningfulValue(r.scheduledStartStopDate) || hasAnyMeaningfulValue(r.prn),
	);
	if (visible.length === 0) return null;

	return (
		<div className="rounded-xl border border-subtle app-bg p-5">
			<div className="text-sm font-semibold text-primary">Medications</div>

			<div className="mt-4 overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="text-left text-muted">
							<th className="py-2 pr-4">Scheduled start/stop</th>
							<th className="py-2">PRN</th>
						</tr>
					</thead>
					<tbody>
						{visible.map((r, idx) => (
							<tr key={idx} className="border-t border-subtle">
								<td className="py-3 pr-4 text-primary">
									{r.scheduledStartStopDate ?? "-"}
								</td>
								<td className="py-3 text-primary">{r.prn ?? "-"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default function MedicationsViewTab({ patientInfo }: { patientInfo: PatientInfo }) {
	const medList = patientInfo.medicationList;

	return (
		<div className="space-y-6">
			<MedTable rows={medList.medications} />

			{Object.keys(MED_EXTRA_LABELS).map((k) => (
				<TextBlock key={k} label={MED_EXTRA_LABELS[k] ?? k} value={(medList as any)[k]} />
			))}
		</div>
	);
}
