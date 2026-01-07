// file: src/pages/student/mrpTool/step4.tsx

import MedicationListForm from "../forms/MedicationListForm";

type Props = { mrp: any };

export default function Step4({mrp}: Props) {
    return (
        <div className="flex flex-col gap-4">
            <MedicationListForm
                value={mrp.patient.medicationList}
                onChange={mrp.patient.setMedicationList}
                onAddMedication={mrp.patient.addMedication}
                onUpdateMedicationAt={mrp.patient.updateMedicationAt}
                onRemoveMedicationAt={mrp.patient.removeMedicationAt}
            />
        </div>
    );
}
