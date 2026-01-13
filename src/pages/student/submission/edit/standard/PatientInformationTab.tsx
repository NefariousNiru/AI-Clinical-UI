// file: src/pages/student/submission/edit/standard/PatientInformationTab.tsx

import type { PatientInfo } from "../../../../../lib/types/studentSubmission";
import PatientDemographicsForm from "../../../forms/PatientDemographicsForm";
import SocialHistoryForm from "../../../forms/SocialHistoryForm";
import MedicalHistoryForm from "../../../forms/MedicalHistoryForm";

type Props = {
	value: PatientInfo;
	onChange: (next: PatientInfo) => void;
	className?: string;
};

export default function PatientInformationTab({ value, onChange, className = "" }: Props) {
	const set = <K extends keyof PatientInfo>(k: K, next: PatientInfo[K]) => {
		onChange({ ...value, [k]: next });
	};

	return (
		<div className={["flex flex-col gap-6", className].join(" ")}>
			<PatientDemographicsForm
				value={value.patientDemographics}
				onChange={(next) => set("patientDemographics", next)}
			/>

			<SocialHistoryForm
				value={value.socialHistory}
				onChange={(next) => set("socialHistory", next)}
			/>

			<MedicalHistoryForm
				value={value.medicalHistory}
				onChange={(next) => set("medicalHistory", next)}
			/>
		</div>
	);
}
