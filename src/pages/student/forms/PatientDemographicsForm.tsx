// file: src/pages/student/forms/PatientDemographicsForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type {PatientDemographics} from "../../../lib/types/studentSubmission";

type Props = {
    value: PatientDemographics;
    onChange: (next: PatientDemographics) => void;
    readOnly?: boolean;
    className?: string;
};

export default function PatientDemographicsForm({value, onChange, readOnly, className = ""}: Props) {
    const set = <K extends keyof PatientDemographics>(k: K, next?: PatientDemographics[K]) =>
        onChange({...value, [k]: next});

    return (
        <FormCard title="patientDemographics" className={className}>
            <div className="flex flex-wrap gap-3">
                <div className="min-w-[260px] flex-1">
                    <FormField label="name" value={value.name} onChange={(x) => set("name", x)} readOnly={readOnly}/>
                </div>
                <div className="min-w-[200px] flex-1">
                    <FormField
                        label="ageDob"
                        value={value.ageDob}
                        onChange={(x) => set("ageDob", x)}
                        readOnly={readOnly}
                    />
                </div>
                <div className="min-w-[160px] flex-1">
                    <FormField label="sex" value={value.sex} onChange={(x) => set("sex", x)} readOnly={readOnly}/>
                </div>
                <div className="min-w-[160px] flex-1">
                    <FormField
                        label="height"
                        value={value.height}
                        onChange={(x) => set("height", x)}
                        readOnly={readOnly}
                    />
                </div>
                <div className="min-w-[160px] flex-1">
                    <FormField
                        label="weight"
                        value={value.weight}
                        onChange={(x) => set("weight", x)}
                        readOnly={readOnly}
                    />
                </div>
                <div className="min-w-[160px] flex-1">
                    <FormField label="bmi" value={value.bmi} onChange={(x) => set("bmi", x)} readOnly={readOnly}/>
                </div>
                <div className="min-w-[220px] flex-1">
                    <FormField
                        label="admitVisitDate"
                        value={value.admitVisitDate}
                        onChange={(x) => set("admitVisitDate", x)}
                        readOnly={readOnly}
                    />
                </div>
                <div className="min-w-[220px] flex-1">
                    <FormField
                        label="insurance"
                        value={value.insurance}
                        onChange={(x) => set("insurance", x)}
                        readOnly={readOnly}
                    />
                </div>

                <div className="basis-full">
                    <FormField
                        label="vitalSigns"
                        value={value.vitalSigns}
                        onChange={(x) => set("vitalSigns", x)}
                        readOnly={readOnly}
                        multiline
                    />
                </div>
                <div className="basis-full">
                    <FormField
                        label="allergies"
                        value={value.allergies}
                        onChange={(x) => set("allergies", x)}
                        readOnly={readOnly}
                        multiline
                    />
                </div>
            </div>
        </FormCard>
    );
}
