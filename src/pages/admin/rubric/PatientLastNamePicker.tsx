// file: src/pages/admin/rubric/PatientLastNamePicker.tsx

import {useMemo} from "react";
import {usePatientLastNames} from "../hooks/rubric";

type Props = {
    label?: string;
    value: string;
    onChange: (next: string) => void;
    disabled?: boolean;
    required?: boolean;
    helperText?: string;
};

export default function PatientLastNamePicker({
                                                  label = "Patient Last Name",
                                                  value,
                                                  onChange,
                                                  disabled = false,
                                                  required = false,
                                                  helperText,
                                              }: Props) {
    const {patients, loading, error} = usePatientLastNames();

    const canInteract = !disabled && !loading;

    const options = useMemo(() => patients ?? [], [patients]);

    return (
        <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold text-muted">
                {label}
                {required ? <span className="text-danger"> *</span> : null}
            </div>

            <select
                className="bg-input border border-subtle rounded-xl px-3 py-2 text-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={!canInteract}
            >
                <option value="">{loading ? "Loading..." : "Select last name"}</option>
                {options.map((p) => (
                    <option key={p} value={p}>
                        {p}
                    </option>
                ))}
            </select>

            {helperText ? <div className="text-xs text-muted">{helperText}</div> : null}
            {error ? <div className="text-xs text-danger">{error}</div> : null}
        </div>
    );
}
