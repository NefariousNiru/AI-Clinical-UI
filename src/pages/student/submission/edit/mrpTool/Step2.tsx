// file: src/pages/student/submission/edit/mrpTool/Step2.tsx

import PatientDemographicsForm from "../../../forms/PatientDemographicsForm.tsx";
import SocialHistoryForm from "../../../forms/SocialHistoryForm.tsx";

type Props = { mrp: any };

export default function Step2({ mrp }: Props) {
	return (
		<div className="flex flex-col gap-4">
			<PatientDemographicsForm
				value={mrp.patient.patientDemographics}
				onChange={mrp.patient.setPatientDemographics}
			/>
			<SocialHistoryForm
				value={mrp.patient.socialHistory}
				onChange={mrp.patient.setSocialHistory}
			/>
		</div>
	);
}
