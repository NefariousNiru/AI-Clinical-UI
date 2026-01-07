// file: src/pages/student/mrpTool/Step7.tsx

import DRPForm from "../forms/DRPForm.tsx";

type Props = { mrp: any };

export default function Step7({ mrp }: Props) {
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
