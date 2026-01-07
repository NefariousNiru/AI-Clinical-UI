// file: src/pages/student/mrpTool/step3.tsx

import MedicalHistoryForm from "../forms/MedicalHistoryForm";

type Props = { mrp: any };

export default function Step3({mrp}: Props) {
    return (
        <div className="flex flex-col gap-4">
            <MedicalHistoryForm
                value={mrp.patient.medicalHistory}
                onChange={mrp.patient.setMedicalHistory}
            />
        </div>
    );
}
