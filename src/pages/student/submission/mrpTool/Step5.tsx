// file: src/pages/student/submission/mrpTool/Step5.tsx

import LabResultForm from "../../forms/LabResultForm.tsx";
import type { StepsProps } from "./MrpToolPage.tsx";

export default function Step5({ mrp }: StepsProps) {
	return (
		<div className="flex flex-col gap-4">
			<LabResultForm value={mrp.patient.labResult} onChange={mrp.patient.setLabResult} />
		</div>
	);
}
