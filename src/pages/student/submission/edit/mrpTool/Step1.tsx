// file: src/pages/student/submission/edit/mrpTool/Step1.tsx

import MrpToolDataForm from "../../../forms/MrpToolDataForm.tsx";

type Props = {
	mrp: any;
};

export default function Step1({ mrp }: Props) {
	return (
		<div className="flex flex-col gap-4">
			<MrpToolDataForm
				value={mrp.patient.mrpToolData}
				onChange={mrp.patient.setMrpToolData}
			/>
		</div>
	);
}
