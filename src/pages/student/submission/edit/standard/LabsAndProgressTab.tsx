// file: src/pages/student/submission/edit/standard/LabsAndProgressnTab.tsx

import type { PatientInfo } from "../../../../../lib/types/studentSubmission";
import LabResultForm from "../../../forms/LabResultForm";
import ProgressNotesForm from "../../../forms/ProgressNotesForm";

type Props = {
	value: PatientInfo;
	onChange: (next: PatientInfo) => void;
	readOnly?: boolean;
	className?: string;
};

export default function LabsAndProgressTab({ value, onChange, readOnly, className = "" }: Props) {
	const set = <K extends keyof PatientInfo>(k: K, next: PatientInfo[K]) => {
		onChange({ ...value, [k]: next });
	};

	return (
		<div className={["flex flex-col gap-6", className].join(" ")}>
			<LabResultForm
				value={value.labResult}
				onChange={(next) => set("labResult", next)}
				readOnly={readOnly}
			/>

			<ProgressNotesForm
				value={value.progressNotes}
				onChange={(next) => set("progressNotes", next)}
				readOnly={readOnly}
			/>
		</div>
	);
}
