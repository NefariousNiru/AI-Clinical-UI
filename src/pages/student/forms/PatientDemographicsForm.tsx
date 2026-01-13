// file: src/pages/student/forms/PatientDemographicsForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { PatientDemographics } from "../../../lib/types/studentSubmission";

type Props = {
	value: PatientDemographics;
	onChange: (next: PatientDemographics) => void;
	readOnly?: boolean;
	className?: string;
};

export default function PatientDemographicsForm({
	value,
	onChange,
	readOnly,
	className = "",
}: Props) {
	const set = <K extends keyof PatientDemographics>(k: K, next?: PatientDemographics[K]) =>
		onChange({ ...value, [k]: next });

	return (
		<FormCard title="Patient Demographics" className={className}>
			<div className="flex flex-wrap gap-3">
				<div className="min-w-[260px] flex-1">
					<FormField
						label="Name"
						value={value.name}
						onChange={(x) => set("name", x)}
						readOnly={readOnly}
						limit={"small"}
					/>
				</div>
				<div className="min-w-[200px] flex-1">
					<FormField
						label="Age/Dob"
						value={value.ageDob}
						onChange={(x) => set("ageDob", x)}
						readOnly={readOnly}
						limit={"xSmall"}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<FormField
						label="Sex"
						value={value.sex}
						onChange={(x) => set("sex", x)}
						readOnly={readOnly}
						limit={"xSmall"}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<FormField
						label="Height"
						value={value.height}
						onChange={(x) => set("height", x)}
						placeholder={"Use units (cm, foot)"}
						readOnly={readOnly}
						limit={"xSmall"}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<FormField
						label="Weight"
						value={value.weight}
						onChange={(x) => set("weight", x)}
						placeholder={"Use units (kg, lbs)"}
						readOnly={readOnly}
						limit={"xSmall"}
					/>
				</div>
				<div className="min-w-[160px] flex-1">
					<FormField
						label="BMI"
						value={value.bmi}
						onChange={(x) => set("bmi", x)}
						readOnly={readOnly}
						limit={"xSmall"}
					/>
				</div>
				<div className="min-w-[220px] flex-1">
					<FormField
						label="Admit / Visit Date"
						value={value.admitVisitDate}
						onChange={(x) => set("admitVisitDate", x)}
						readOnly={readOnly}
						limit={"xSmall"}
					/>
				</div>
				<div className="min-w-[220px] flex-1">
					<FormField
						label="Insurance"
						value={value.insurance}
						onChange={(x) => set("insurance", x)}
						readOnly={readOnly}
						limit={"small"}
					/>
				</div>

				<div className="basis-full">
					<FormField
						label="Vital Signs"
						value={value.vitalSigns}
						onChange={(x) => set("vitalSigns", x)}
						placeholder={"e.g., BP, HR, RR, Temp, O2 Sat (SpO2)..."}
						readOnly={readOnly}
						multiline
						limit={"small"}
						showCounter
					/>
				</div>
				<div className="basis-full">
					<FormField
						label="Allergies"
						value={value.allergies}
						onChange={(x) => set("allergies", x)}
						readOnly={readOnly}
						multiline
						limit={"medium"}
						showCounter
					/>
				</div>
			</div>
		</FormCard>
	);
}
