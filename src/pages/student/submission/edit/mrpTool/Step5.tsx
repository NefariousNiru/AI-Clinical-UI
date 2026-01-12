// file: src/pages/student/submission/edit/mrpTool/Step5.tsx

import LabResultForm from "../../../forms/LabResultForm.tsx";

type Props = { mrp: any };

export default function Step5({ mrp }: Props) {
	return (
		<div className="flex flex-col gap-4">
			<LabResultForm value={mrp.patient.labResult} onChange={mrp.patient.setLabResult} />
		</div>
	);
}
