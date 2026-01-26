// file: src/pages/student/submission/mrpTool/Step4.tsx

import MedicationListForm from "../../forms/MedicationListForm.tsx";
import type { StepsProps } from "./MrpToolPage.tsx";

export default function Step4({ mrp }: StepsProps) {
	return (
		<div className="flex flex-col gap-4">
			<MedicationListForm
				value={mrp.patient.medicationList}
				onChange={mrp.patient.setMedicationList}
				onAddMedication={mrp.patient.addMedication}
				onUpdateMedicationAt={mrp.patient.updateMedicationAt}
				onRemoveMedicationAt={mrp.patient.removeMedicationAt}
			/>
		</div>
	);
}
