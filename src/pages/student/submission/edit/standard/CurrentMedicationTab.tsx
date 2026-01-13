// file: src/pages/student/submission/edit/standard/CurrentMedicationTab.tsx

import MedicationListForm from "../../../forms/MedicationListForm";
import type { PatientInfoFormController } from "../../../hooks/useStudentSubmissionEditor.ts";

type Props = {
	patient: PatientInfoFormController;
	className?: string;
};

export default function CurrentMedicationTab({ patient, className = "" }: Props) {
	return (
		<div className={["flex flex-col gap-6", className].join(" ")}>
			<MedicationListForm
				value={patient.medicationList}
				onChange={patient.setMedicationList}
				onAddMedication={patient.addMedication}
				onRemoveMedicationAt={patient.removeMedicationAt}
				onUpdateMedicationAt={patient.updateMedicationAt}
			/>
		</div>
	);
}
