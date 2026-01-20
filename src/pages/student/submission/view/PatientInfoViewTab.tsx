// file: src/pages/student/submission/view/standard/tabs/PatientInfoViewTab.tsx

import type { PatientInfo } from "../../../../lib/types/studentSubmission";
import { hasAnyMeaningfulValue } from "../../hooks/useMrpToolSubmissionEditor.ts";

// TODO: import your label maps from your existing constants file
// Example shape expected:
// const DEMO_LABELS: Record<string, string> = { name: "Name", ageDob: "Age", sex: "Gender", ... };

const DEMO_LABELS: Record<string, string> = {
	name: "Name",
	ageDob: "Age",
	sex: "Gender",
	weight: "Weight",
	height: "Height",
	allergies: "Allergies",
};

function FieldGrid({
	title,
	entries,
}: {
	title: string;
	entries: Array<{ label: string; value: unknown }>;
}) {
	const visible = entries.filter((e) => hasAnyMeaningfulValue(e.value));
	if (visible.length === 0) return null;

	return (
		<div className="rounded-xl border border-subtle app-bg p-5">
			<div className="text-sm font-semibold text-primary">{title}</div>
			<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{visible.map((e) => (
					<div key={e.label}>
						<div className="text-xs text-muted">{e.label}</div>
						<div className="mt-1 text-sm text-primary">{String(e.value)}</div>
					</div>
				))}
			</div>
		</div>
	);
}

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

export default function PatientInfoViewTab({ patientInfo }: { patientInfo: PatientInfo }) {
	const demo = patientInfo.patientDemographics;
	const prog = patientInfo.progressNotes;
	const medHx = patientInfo.medicalHistory;
	const social = patientInfo.socialHistory;

	const demoEntries = Object.keys(DEMO_LABELS).map((k) => ({
		label: DEMO_LABELS[k] ?? k,
		value: (demo as any)[k],
	}));

	return (
		<div className="space-y-6">
			<FieldGrid title="Demographics" entries={demoEntries} />

			<TextBlock label="Chief Complaint" value={prog.chiefComplaint} />
			<TextBlock label="History of Present Illness" value={prog.historyOfPresentIllness} />
			<TextBlock label="Past Medical History" value={medHx.pastMedicalHistory} />
			<TextBlock
				label="Social History"
				value={Object.values(social).filter(hasAnyMeaningfulValue).join(" ")}
			/>
		</div>
	);
}
