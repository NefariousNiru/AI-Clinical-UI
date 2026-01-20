// file: src/pages/student/forms/ProgressNotesForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { ProgressNotes } from "../../../lib/types/studentSubmission";
import { PROGRESS_NOTES_FIELDS } from "../hooks/constants.ts";

type Props = {
	value: ProgressNotes;
	onChange: (next: ProgressNotes) => void;
	className?: string;
};

export default function ProgressNotesForm({ value, onChange, className = "" }: Props) {
	const set = <K extends keyof ProgressNotes>(k: K, next?: ProgressNotes[K]) =>
		onChange({ ...value, [k]: next });

	const CONSTANTS = PROGRESS_NOTES_FIELDS;
	const FIELDS = CONSTANTS.fields;

	return (
		<FormCard title={CONSTANTS.title} className={className}>
			<div className="flex flex-col gap-3">
				<FormField
					label={FIELDS.chiefComplaint.label}
					value={value.chiefComplaint}
					onChange={(x) => set("chiefComplaint", x)}
					limit={FIELDS.chiefComplaint.limit}
					showCounter={FIELDS.chiefComplaint.showCounter}
					multiline={FIELDS.chiefComplaint.multiline}
				/>
				<FormField
					label={FIELDS.historyOfPresentIllness.label}
					value={value.historyOfPresentIllness}
					onChange={(x) => set("historyOfPresentIllness", x)}
					limit={FIELDS.historyOfPresentIllness.limit}
					showCounter={FIELDS.historyOfPresentIllness.showCounter}
					multiline={FIELDS.historyOfPresentIllness.multiline}
				/>
				<FormField
					label={FIELDS.immunizations.label}
					value={value.immunizations}
					onChange={(x) => set("immunizations", x)}
					limit={FIELDS.immunizations.limit}
					showCounter={FIELDS.immunizations.showCounter}
					multiline={FIELDS.immunizations.multiline}
				/>
				<FormField
					label={FIELDS.progressNotes.label}
					value={value.progressNotes}
					onChange={(x) => set("progressNotes", x)}
					limit={FIELDS.progressNotes.limit}
					showCounter={FIELDS.progressNotes.showCounter}
					multiline={FIELDS.progressNotes.multiline}
				/>
				<FormField
					label={FIELDS.preliminaryProblemList.label}
					value={value.preliminaryProblemList}
					onChange={(x) => set("preliminaryProblemList", x)}
					limit={FIELDS.preliminaryProblemList.limit}
					showCounter={FIELDS.preliminaryProblemList.showCounter}
					multiline={FIELDS.preliminaryProblemList.multiline}
				/>
			</div>
		</FormCard>
	);
}
