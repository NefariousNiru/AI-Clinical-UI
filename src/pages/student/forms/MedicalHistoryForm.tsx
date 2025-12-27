// file: src/pages/student/forms/MedicalHistoryForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type { MedicalHistory } from "../../../lib/types/studentSubmission";

type Props = {
    value: MedicalHistory;
    onChange: (next: MedicalHistory) => void;
    readOnly?: boolean;
    className?: string;
};

export default function MedicalHistoryForm({ value, onChange, readOnly, className = "" }: Props) {
    const set = <K extends keyof MedicalHistory>(k: K, next?: MedicalHistory[K]) =>
        onChange({ ...value, [k]: next });

    return (
        <FormCard title="medicalHistory" className={className}>
            <div className="flex flex-col gap-3">
                <FormField
                    label="problemList"
                    value={value.problemList}
                    onChange={(x) => set("problemList", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="pastMedicalHistory"
                    value={value.pastMedicalHistory}
                    onChange={(x) => set("pastMedicalHistory", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="familyHistory"
                    value={value.familyHistory}
                    onChange={(x) => set("familyHistory", x)}
                    readOnly={readOnly}
                    multiline
                />
            </div>
        </FormCard>
    );
}
