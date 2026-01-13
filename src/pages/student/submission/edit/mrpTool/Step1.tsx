// file: src/pages/student/submission/edit/mrpTool/Step1.tsx

import MrpToolDataForm from "../../../forms/MrpToolDataForm.tsx";
import type { StepsProps } from "./MrpToolPage.tsx";

export default function Step1({ mrp }: StepsProps) {
	return (
		<div className="flex flex-col gap-4">
			<MrpToolDataForm
				value={mrp.patient.mrpToolData}
				onChange={mrp.patient.setMrpToolData}
			/>
		</div>
	);
}
