// file: src/pages/student/forms/MedicalHistoryForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { MedicalHistory } from "../../../lib/types/studentSubmission";
import { MEDICAL_HISTORY_FIELDS } from "../hooks/constants.ts";

type Props = {
	value: MedicalHistory;
	onChange: (next: MedicalHistory) => void;
	className?: string;
};

export default function MedicalHistoryForm({ value, onChange, className = "" }: Props) {
	const set = <K extends keyof MedicalHistory>(k: K, next?: MedicalHistory[K]) =>
		onChange({ ...value, [k]: next });

	const CONSTANTS = MEDICAL_HISTORY_FIELDS;
	const FIELDS = CONSTANTS.fields;

	return (
		<FormCard title={CONSTANTS.title} className={className}>
			<div className="flex flex-col gap-3">
				<FormField
					label={FIELDS.problemList.label}
					value={value.problemList}
					onChange={(x) => set("problemList", x)}
					placeholder={FIELDS.problemList.placeholder}
					limit={FIELDS.problemList.limit}
					showCounter={FIELDS.problemList.showCounter}
					multiline={FIELDS.problemList.multiline}
				/>
				<FormField
					label={FIELDS.pastMedicalHistory.label}
					value={value.pastMedicalHistory}
					onChange={(x) => set("pastMedicalHistory", x)}
					placeholder={FIELDS.pastMedicalHistory.placeholder}
					limit={FIELDS.pastMedicalHistory.limit}
					showCounter={FIELDS.pastMedicalHistory.showCounter}
					multiline={FIELDS.pastMedicalHistory.multiline}
				/>
				<FormField
					label={FIELDS.familyHistory.label}
					value={value.familyHistory}
					onChange={(x) => set("familyHistory", x)}
					limit={FIELDS.familyHistory.limit}
					showCounter={FIELDS.familyHistory.showCounter}
					multiline={FIELDS.familyHistory.multiline}
					placeholder={FIELDS.familyHistory.placeholder}
				/>
			</div>
		</FormCard>
	);
}
