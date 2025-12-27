// file: src/pages/student/forms/LabResultForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type {LabResult} from "../../../lib/types/studentSubmission";

type Props = {
    value: LabResult;
    onChange: (next: LabResult) => void;
    readOnly?: boolean;
    className?: string;
};

export default function LabResultForm({value, onChange, readOnly, className = ""}: Props) {
    const set = <K extends keyof LabResult>(k: K, next?: LabResult[K]) => onChange({...value, [k]: next});

    return (
        <FormCard title="labResult" className={className}>
            <div className="flex flex-col gap-3">
                <FormField
                    label="labsImagingMicrobiology"
                    value={value.labsImagingMicrobiology}
                    onChange={(x) => set("labsImagingMicrobiology", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="renalFunctionAssessment"
                    value={value.renalFunctionAssessment}
                    onChange={(x) => set("renalFunctionAssessment", x)}
                    readOnly={readOnly}
                    multiline
                />
            </div>
        </FormCard>
    );
}
