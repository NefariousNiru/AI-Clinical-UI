// file: src/pages/student/submission/edit/mrpTool/Step7.tsx

import DRPForm from "../../../forms/DRPForm.tsx";
import type { StepsProps } from "./MrpToolPage.tsx";

export default function Step7({ mrp }: StepsProps) {
	return (
		<div className="flex flex-col gap-4">
			<DRPForm
				title="Health Care Problems"
				items={mrp.studentDrpAnswers ?? []}
				onChange={mrp.setStudentDrpAnswers}
			/>
		</div>
	);
}
