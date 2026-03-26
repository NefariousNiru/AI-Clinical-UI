// file: src/pages/student/forms/PatientDemographicsForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { PatientDemographics } from "../../../lib/types/studentSubmission";
import { PATIENT_DEMOGRAPHICS_FIELDS } from "../hooks/constants.ts";

type Props = {
	value: PatientDemographics;
	onChange: (next: PatientDemographics) => void;
	className?: string;
};

export default function PatientDemographicsForm({ value, onChange, className = "" }: Props) {
	const set = <K extends keyof PatientDemographics>(k: K, next?: PatientDemographics[K]) =>
		onChange({ ...value, [k]: next });

	const CONSTANTS = PATIENT_DEMOGRAPHICS_FIELDS;
	const FIELDS = CONSTANTS.fields;

	return (
		<FormCard title={CONSTANTS.title} className={className}>
			<div className="flex flex-wrap gap-3">
				<div className="min-w-[260px] flex-1">
					<FormField
						label={FIELDS.name.label}
						value={value.name}
						onChange={(x) => set("name", x)}
						limit={FIELDS.name.limit}
					/>
				</div>
				<div className="min-w-[200px] flex-1">
					<FormField
						label={FIELDS.ageDob.label}
						value={value.ageDob}
						onChange={(x) => set("ageDob", x)}
						limit={FIELDS.ageDob.limit}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<FormField
						label={FIELDS.sex.label}
						value={value.sex}
						onChange={(x) => set("sex", x)}
						limit={FIELDS.sex.limit}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<FormField
						label={FIELDS.height.label}
						value={value.height}
						onChange={(x) => set("height", x)}
						placeholder={FIELDS.height.placeholder}
						limit={FIELDS.height.limit}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<FormField
						label={FIELDS.weight.label}
						value={value.weight}
						onChange={(x) => set("weight", x)}
						placeholder={FIELDS.weight.placeholder}
						limit={FIELDS.weight.limit}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<FormField
						label={FIELDS.bmi.label}
						value={value.bmi}
						onChange={(x) => set("bmi", x)}
						limit={FIELDS.bmi.limit}
					/>
				</div>
				<div className="min-w-[220px] flex-1">
					<FormField
						label={FIELDS.admitVisitDate.label}
						value={value.admitVisitDate}
						onChange={(x) => set("admitVisitDate", x)}
						limit={FIELDS.admitVisitDate.limit}
					/>
				</div>
				<div className="min-w-[220px] flex-1">
					<FormField
						label={FIELDS.insurance.label}
						value={value.insurance}
						onChange={(x) => set("insurance", x)}
						limit={FIELDS.insurance.limit}
					/>
				</div>

				<div className="basis-full">
					<FormField
						label={FIELDS.vitalSigns.label}
						value={value.vitalSigns}
						onChange={(x) => set("vitalSigns", x)}
						placeholder={FIELDS.vitalSigns.placeholder}
						limit={FIELDS.vitalSigns.limit}
						showCounter={FIELDS.vitalSigns.showCounter}
						multiline={FIELDS.vitalSigns.multiline}
					/>
				</div>
				<div className="basis-full">
					<FormField
						label={FIELDS.allergies.label}
						value={value.allergies}
						onChange={(x) => set("allergies", x)}
						limit={FIELDS.allergies.limit}
						showCounter={FIELDS.allergies.showCounter}
						multiline={FIELDS.allergies.multiline}
					/>
				</div>
			</div>
		</FormCard>
	);
}
