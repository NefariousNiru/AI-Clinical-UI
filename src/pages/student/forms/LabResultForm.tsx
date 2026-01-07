// file: src/pages/student/forms/LabResultForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { LabResult } from "../../../lib/types/studentSubmission";

type Props = {
	value: LabResult;
	onChange: (next: LabResult) => void;
	readOnly?: boolean;
	className?: string;
};

export default function LabResultForm({ value, onChange, readOnly, className = "" }: Props) {
	const set = <K extends keyof LabResult>(k: K, next?: LabResult[K]) =>
		onChange({ ...value, [k]: next });

	return (
		<FormCard title="Lab Results" className={className}>
			<div className="flex flex-col gap-3">
				<FormField
					label="Labs / Imaging / Microbiology (Relevant / Normal)"
					value={value.labsImagingMicrobiology}
					onChange={(x) => set("labsImagingMicrobiology", x)}
					readOnly={readOnly}
					placeholder={
						"Include all relevant lab values with reference ranges, dates, trends..."
					}
					multiline
					limit={"medium"}
					showCounter
				/>
				<FormField
					label="Renal Function Assessment"
					value={value.renalFunctionAssessment}
					onChange={(x) => set("renalFunctionAssessment", x)}
					readOnly={readOnly}
					placeholder={
						"e.g., SCr (Serum Creatinine), eGFR, CrCl, assessment of renal function"
					}
					multiline
					limit={"medium"}
					showCounter
				/>
			</div>
		</FormCard>
	);
}
