// file: src/pages/student/submission/view/standard/tabs/LabsAndProgressViewTab.tsx

import type { PatientInfo } from "../../../../lib/types/studentSubmission";
import { hasAnyMeaningfulValue } from "../../hooks/useMrpToolSubmissionEditor.ts";

// TODO: import label maps from your constants file
const LABS_LABELS: Record<string, string> = {
	labsImagingMicrobiology: "Labs / Imaging / Microbiology",
	renalFunctionAssessment: "Renal Function Assessment",
};

const PROGRESS_LABELS: Record<string, string> = {
	immunizations: "Immunizations",
	progressNotes: "Progress Notes",
	preliminaryProblemList: "Preliminary Problem List",
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

export default function LabsAndProgressViewTab({ patientInfo }: { patientInfo: PatientInfo }) {
	const lab = patientInfo.labResult;
	const prog = patientInfo.progressNotes;

	return (
		<div className="space-y-6">
			{Object.keys(LABS_LABELS).map((k) => (
				<TextBlock key={k} label={LABS_LABELS[k] ?? k} value={(lab as any)[k]} />
			))}

			{Object.keys(PROGRESS_LABELS).map((k) => (
				<TextBlock key={k} label={PROGRESS_LABELS[k] ?? k} value={(prog as any)[k]} />
			))}
		</div>
	);
}
