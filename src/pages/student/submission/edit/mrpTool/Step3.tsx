// file: src/pages/student/submission/edit/mrpTool/Step3.tsx

import MedicalHistoryForm from "../../../forms/MedicalHistoryForm.tsx";
import type { StepsProps } from "./MrpToolPage.tsx";

export default function Step3({ mrp }: StepsProps) {
	return (
		<div className="flex flex-col gap-4">
			<MedicalHistoryForm
				value={mrp.patient.medicalHistory}
				onChange={mrp.patient.setMedicalHistory}
			/>
		</div>
	);
}
