// file: src/pages/student/forms/MedicalHistoryForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { MedicalHistory } from "../../../lib/types/studentSubmission";

type Props = {
	value: MedicalHistory;
	onChange: (next: MedicalHistory) => void;
	className?: string;
};

export default function MedicalHistoryForm({ value, onChange, className = "" }: Props) {
	const set = <K extends keyof MedicalHistory>(k: K, next?: MedicalHistory[K]) =>
		onChange({ ...value, [k]: next });

	return (
		<FormCard title="Problem List & Medical History" className={className}>
			<div className="flex flex-col gap-3">
				<FormField
					label="Problem List"
					value={value.problemList}
					onChange={(x) => set("problemList", x)}
					placeholder={"List all relevant current problems"}
					multiline
					limit={"medium"}
					showCounter
				/>
				<FormField
					label="Medical History"
					value={value.pastMedicalHistory}
					onChange={(x) => set("pastMedicalHistory", x)}
					placeholder={"List all relevant medical history"}
					multiline
					limit={"medium"}
					showCounter
				/>
				<FormField
					label="Family History"
					value={value.familyHistory}
					onChange={(x) => set("familyHistory", x)}
					multiline
					limit={"medium"}
					showCounter
				/>
			</div>
		</FormCard>
	);
}
