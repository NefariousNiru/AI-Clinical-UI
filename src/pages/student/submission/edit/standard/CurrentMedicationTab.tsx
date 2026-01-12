// file: src/pages/student/submission/edit/standard/CurrentMedicationTab.tsx

import type { MedicationHistory, MedicationList } from "../../../../../lib/types/studentSubmission";
import MedicationListForm from "../../../forms/MedicationListForm";

type Props = {
	value: MedicationList;
	onChange: (next: MedicationList) => void;
	readOnly?: boolean;
	className?: string;
};

function makeEmptyMedication(): MedicationHistory {
	return {
		scheduledStartStopDate: undefined,
		prn: undefined,
	};
}

export default function CurrentMedicationTab({ value, onChange, readOnly, className = "" }: Props) {
	const addMedication = () => {
		if (readOnly) return;
		onChange({ ...value, medications: [...value.medications, makeEmptyMedication()] });
	};

	const removeMedicationAt = (index: number) => {
		if (readOnly) return;
		const next = value.medications.filter((_, i) => i !== index);
		onChange({ ...value, medications: next });
	};

	const updateMedicationAt = (index: number, patch: Partial<MedicationHistory>) => {
		if (readOnly) return;
		const meds = value.medications.slice();
		const cur = meds[index];
		if (!cur) return;
		meds[index] = { ...cur, ...patch };
		onChange({ ...value, medications: meds });
	};

	return (
		<div className={["flex flex-col gap-6", className].join(" ")}>
			<MedicationListForm
				value={value}
				onChange={onChange}
				readOnly={readOnly}
				onAddMedication={addMedication}
				onRemoveMedicationAt={removeMedicationAt}
				onUpdateMedicationAt={updateMedicationAt}
			/>
		</div>
	);
}
