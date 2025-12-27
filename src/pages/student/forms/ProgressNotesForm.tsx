// file: src/pages/student/forms/ProgressNotesForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type {ProgressNotes} from "../../../lib/types/studentSubmission";

type Props = {
    value: ProgressNotes;
    onChange: (next: ProgressNotes) => void;
    readOnly?: boolean;
    className?: string;
};

export default function ProgressNotesForm({value, onChange, readOnly, className = ""}: Props) {
    const set = <K extends keyof ProgressNotes>(k: K, next?: ProgressNotes[K]) =>
        onChange({...value, [k]: next});

    return (
        <FormCard title="progressNotes" className={className}>
            <div className="flex flex-col gap-3">
                <FormField
                    label="chiefComplaint"
                    value={value.chiefComplaint}
                    onChange={(x) => set("chiefComplaint", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="historyOfPresentIllness"
                    value={value.historyOfPresentIllness}
                    onChange={(x) => set("historyOfPresentIllness", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="immunizations"
                    value={value.immunizations}
                    onChange={(x) => set("immunizations", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="progressNotes"
                    value={value.progressNotes}
                    onChange={(x) => set("progressNotes", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="preliminaryProblemList"
                    value={value.preliminaryProblemList}
                    onChange={(x) => set("preliminaryProblemList", x)}
                    readOnly={readOnly}
                    multiline
                />
            </div>
        </FormCard>
    );
}
