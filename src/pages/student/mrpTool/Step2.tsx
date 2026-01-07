// file: src/pages/student/mrpTool/step2.tsx

import PatientDemographicsForm from "../forms/PatientDemographicsForm";
import SocialHistoryForm from "../forms/SocialHistoryForm";

type Props = { mrp: any };

export default function Step2({mrp}: Props) {
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
