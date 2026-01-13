// file: src/pages/student/submission/edit/mrpTool/Step6.tsx

import ProgressNotesForm from "../../../forms/ProgressNotesForm.tsx";
import type { StepsProps } from "./MrpToolPage.tsx";

export default function Step6({ mrp }: StepsProps) {
	return (
		<div className="flex flex-col gap-4">
			<ProgressNotesForm
				value={mrp.patient.progressNotes}
				onChange={mrp.patient.setProgressNotes}
			/>
		</div>
	);
}
