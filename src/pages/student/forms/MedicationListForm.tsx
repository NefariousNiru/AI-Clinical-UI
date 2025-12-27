// file: src/pages/student/forms/MedicationListForm.tsx

import FormCard from "./FormCard";
import FormField from "./FormField";
import type {MedicationList} from "../../../lib/types/studentSubmission";

type Props = {
    value: MedicationList;
    onChange: (next: MedicationList) => void;

    // If you want to manage array ops outside, pass these. If not, component still works without them.
    onAddMedication?: () => void;
    onRemoveMedicationAt?: (index: number) => void;
    onUpdateMedicationAt?: (index: number, patch: { scheduledStartStopDate?: string; prn?: string }) => void;

    readOnly?: boolean;
    className?: string;
};

export default function MedicationListForm({
                                               value,
                                               onChange,
                                               onAddMedication,
                                               onRemoveMedicationAt,
                                               onUpdateMedicationAt,
                                               readOnly,
                                               className = "",
                                           }: Props) {
    const set = <K extends keyof MedicationList>(k: K, next: MedicationList[K]) =>
        onChange({...value, [k]: next});

    const toggle = (k: "sup" | "vtePpx" | "bowelRegimen") => {
        const cur = Boolean(value[k]);
        set(k, (!cur as unknown) as MedicationList[typeof k]);
    };

    return (
        <FormCard title="medicationList" className={className}>
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-primary text-sm">
                        <input type="checkbox" checked={Boolean(value.sup)} onChange={() => toggle("sup")}
                               disabled={readOnly}/>
                        <span>sup</span>
                    </label>
                    <label className="flex items-center gap-2 text-primary text-sm">
                        <input type="checkbox" checked={Boolean(value.vtePpx)} onChange={() => toggle("vtePpx")}
                               disabled={readOnly}/>
                        <span>vtePpx</span>
                    </label>
                    <label className="flex items-center gap-2 text-primary text-sm">
                        <input
                            type="checkbox"
                            checked={Boolean(value.bowelRegimen)}
                            onChange={() => toggle("bowelRegimen")}
                            disabled={readOnly}
                        />
                        <span>bowelRegimen</span>
                    </label>

                    {onAddMedication && !readOnly ? (
                        <button
                            type="button"
                            onClick={onAddMedication}
                            className="ml-auto rounded-lg border border-subtle px-3 py-1.5 text-sm text-primary shadow-sm"
                        >
                            Add medication
                        </button>
                    ) : null}
                </div>

                <div className="flex flex-col gap-3">
                    {value.medications.map((m, idx) => (
                        <div
                            key={idx}
                            className="border border-subtle rounded-xl p-3 shadow-sm flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-2">
                                <div className="text-primary text-xs font-semibold">medications[{idx}]</div>
                                {onRemoveMedicationAt && !readOnly ? (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveMedicationAt(idx)}
                                        className="ml-auto rounded-lg border border-subtle px-2 py-1 text-xs text-primary"
                                    >
                                        Remove
                                    </button>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <div className="min-w-[240px] flex-1">
                                    <FormField
                                        label="scheduledStartStopDate"
                                        value={m.scheduledStartStopDate}
                                        onChange={(x) => onUpdateMedicationAt?.(idx, {scheduledStartStopDate: x})}
                                        readOnly={readOnly || !onUpdateMedicationAt}
                                    />
                                </div>
                                <div className="min-w-[240px] flex-1">
                                    <FormField
                                        label="prn"
                                        value={m.prn}
                                        onChange={(x) => onUpdateMedicationAt?.(idx, {prn: x})}
                                        readOnly={readOnly || !onUpdateMedicationAt}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <FormField
                    label="ivAccessLineTubes"
                    value={value.ivAccessLineTubes}
                    onChange={(x) => set("ivAccessLineTubes", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="otcCam"
                    value={value.otcCam}
                    onChange={(x) => set("otcCam", x)}
                    readOnly={readOnly}
                    multiline
                />
                <FormField
                    label="medicationAdherence"
                    value={value.medicationAdherence}
                    onChange={(x) => set("medicationAdherence", x)}
                    readOnly={readOnly}
                    multiline
                />
            </div>
        </FormCard>
    );
}
