// file: src/pages/student/submission/standard/HelathCareProblemTab.tsx

import type { StudentDrpAnswer } from "../../../../lib/types/studentSubmission.ts";
import DRPForm from "../../forms/DRPForm.tsx";

type Props = {
	items: StudentDrpAnswer[];
	onChange: (next: StudentDrpAnswer[]) => void;
	className?: string;
};

export default function HealthCareProblemTab({ items, onChange, className = "" }: Props) {
	return (
		<div className={["flex flex-col gap-6", className].join(" ")}>
			<DRPForm items={items} onChange={onChange} />
		</div>
	);
}
