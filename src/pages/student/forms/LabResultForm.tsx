// file: src/pages/student/forms/LabResultForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { LabResult } from "../../../lib/types/studentSubmission";
import { LAB_RESULT_FIELDS } from "../hooks/constants.ts";

type Props = {
	value: LabResult;
	onChange: (next: LabResult) => void;
	className?: string;
};

export default function LabResultForm({ value, onChange, className = "" }: Props) {
	const set = <K extends keyof LabResult>(k: K, next?: LabResult[K]) =>
		onChange({ ...value, [k]: next });

	const CONSTANTS = LAB_RESULT_FIELDS;
	const FIELDS = CONSTANTS.fields;

	return (
		<FormCard title={CONSTANTS.title} className={className}>
			<div className="flex flex-col gap-3">
				<FormField
					label={FIELDS.labsImagingMicrobiology.label}
					value={value.labsImagingMicrobiology}
					onChange={(x) => set("labsImagingMicrobiology", x)}
					placeholder={FIELDS.labsImagingMicrobiology.placeholder}
					limit={FIELDS.labsImagingMicrobiology.limit}
					showCounter={FIELDS.labsImagingMicrobiology.showCounter}
					multiline={FIELDS.labsImagingMicrobiology.multiline}
				/>
				<FormField
					label={FIELDS.renalFunctionAssessment.label}
					value={value.renalFunctionAssessment}
					onChange={(x) => set("renalFunctionAssessment", x)}
					placeholder={FIELDS.renalFunctionAssessment.placeholder}
					limit={FIELDS.renalFunctionAssessment.limit}
					showCounter={FIELDS.renalFunctionAssessment.showCounter}
					multiline={FIELDS.renalFunctionAssessment.multiline}
				/>
			</div>
		</FormCard>
	);
}
