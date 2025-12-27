// file: src/pages/student/forms/SocialHistoryForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type {SocialHistory} from "../../../lib/types/studentSubmission";

type Props = {
    value: SocialHistory;
    onChange: (next: SocialHistory) => void;
    readOnly?: boolean;
    className?: string;
};

export default function SocialHistoryForm({value, onChange, readOnly, className = ""}: Props) {
    const set = <K extends keyof SocialHistory>(k: K, next?: SocialHistory[K]) =>
        onChange({...value, [k]: next});

    return (
        <FormCard title="socialHistory" className={className}>
            <div className="flex flex-wrap gap-3">
                <div className="min-w-[240px] flex-1">
                    <FormField
                        label="occupation"
                        value={value.occupation}
                        onChange={(x) => set("occupation", x)}
                        readOnly={readOnly}
                    />
                </div>
                <div className="min-w-[240px] flex-1">
                    <FormField
                        label="supportSystem"
                        value={value.supportSystem}
                        onChange={(x) => set("supportSystem", x)}
                        readOnly={readOnly}
                    />
                </div>

                <div className="min-w-[220px] flex-1">
                    <FormField
                        label="tobaccoUse"
                        value={value.tobaccoUse}
                        onChange={(x) => set("tobaccoUse", x)}
                        readOnly={readOnly}
                    />
                </div>
                <div className="min-w-[220px] flex-1">
                    <FormField label="thcUse" value={value.thcUse} onChange={(x) => set("thcUse", x)}
                               readOnly={readOnly}/>
                </div>
                <div className="min-w-[220px] flex-1">
                    <FormField
                        label="alcoholUse"
                        value={value.alcoholUse}
                        onChange={(x) => set("alcoholUse", x)}
                        readOnly={readOnly}
                    />
                </div>
                <div className="min-w-[220px] flex-1">
                    <FormField
                        label="cocaineUse"
                        value={value.cocaineUse}
                        onChange={(x) => set("cocaineUse", x)}
                        readOnly={readOnly}
                    />
                </div>

                <div className="basis-full">
                    <FormField
                        label="otherSubstanceUse"
                        value={value.otherSubstanceUse}
                        onChange={(x) => set("otherSubstanceUse", x)}
                        readOnly={readOnly}
                        multiline
                    />
                </div>
            </div>
        </FormCard>
    );
}
