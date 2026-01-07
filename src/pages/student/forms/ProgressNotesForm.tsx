// file: src/pages/student/forms/ProgressNotesForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { ProgressNotes } from "../../../lib/types/studentSubmission";

type Props = {
	value: ProgressNotes;
	onChange: (next: ProgressNotes) => void;
	readOnly?: boolean;
	className?: string;
};

export default function ProgressNotesForm({ value, onChange, readOnly, className = "" }: Props) {
	const set = <K extends keyof ProgressNotes>(k: K, next?: ProgressNotes[K]) =>
		onChange({ ...value, [k]: next });

	return (
		<FormCard title="Progress Notes" className={className}>
			<div className="flex flex-col gap-3">
				<FormField
					label="Chief Complaint / Reason for Visit"
					value={value.chiefComplaint}
					onChange={(x) => set("chiefComplaint", x)}
					readOnly={readOnly}
					multiline
					limit={"medium"}
					showCounter
				/>
				<FormField
					label="History of Present Illness"
					value={value.historyOfPresentIllness}
					onChange={(x) => set("historyOfPresentIllness", x)}
					readOnly={readOnly}
					multiline
					limit={"medium"}
					showCounter
				/>
				<FormField
					label="Immunizations"
					value={value.immunizations}
					onChange={(x) => set("immunizations", x)}
					readOnly={readOnly}
					multiline
					limit={"medium"}
					showCounter
				/>
				<FormField
					label="Progress Notes / Relevant Clinical Notes"
					value={value.progressNotes}
					onChange={(x) => set("progressNotes", x)}
					readOnly={readOnly}
					multiline
					limit={"medium"}
					showCounter
				/>
				<FormField
					label="Preliminary Problem List / Relevant Notes"
					value={value.preliminaryProblemList}
					onChange={(x) => set("preliminaryProblemList", x)}
					readOnly={readOnly}
					multiline
					limit={"medium"}
					showCounter
				/>
			</div>
		</FormCard>
	);
}
