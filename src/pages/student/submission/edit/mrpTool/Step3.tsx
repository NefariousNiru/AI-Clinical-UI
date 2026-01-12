// file: src/pages/student/submission/edit/mrpTool/Step3.tsx

import MedicalHistoryForm from "../../../forms/MedicalHistoryForm.tsx";

type Props = { mrp: any };

export default function Step3({ mrp }: Props) {
	return (
		<div className="flex flex-col gap-4">
			<MedicalHistoryForm
				value={mrp.patient.medicalHistory}
				onChange={mrp.patient.setMedicalHistory}
			/>
		</div>
	);
}
