// file: src/pages/admin/weeks/RubricIdPicker.tsx

import {useMemo, useState} from "react";
import {titleizeDiseaseName} from "../../../lib/utils/functions.ts";
import {useRubricIdPager} from "../hooks/weeks.ts";

type Props = {
    patientLastName: string;
    value: string[];
    onChange: (next: string[]) => void;
    disabled?: boolean;
};

export default function RubricIdPicker({patientLastName, value, onChange, disabled = false}: Props) {
    const last = patientLastName.trim();
    const locked = disabled || !last;

    const {ids, loading, error, canPrev, canNext, prev, next, pageLabel} = useRubricIdPager(last, 20);
    const [pending, setPending] = useState<string>("");

    const options = useMemo(() => {
        const set = new Set(value);
        return ids.filter((x) => !set.has(x));
    }, [ids, value]);

    function addSelected() {
        const v = pending.trim();
        if (!v) return;
        if (value.includes(v)) return;
        onChange([...value, v]);
        setPending("");
    }

    function removeOne(x: string) {
        onChange(value.filter((a) => a !== x));
    }

    return (
        <div className="flex flex-col gap-2">
            {!last ? (
                <div className="text-xs text-muted">Select patient last name first to load diseases.</div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3">
                    <select
                        className="bg-input border border-subtle rounded-xl px-3 py-2 text-sm"
                        value={pending}
                        onChange={(e) => setPending(e.target.value)}
                        disabled={locked || loading}
                    >
                        <option value="">{loading ? "Loading..." : "Select disease"}</option>
                        {options.map((x) => (
                            <option key={x} value={x}>
                                {titleizeDiseaseName(x)}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className={[
                            "px-3 py-2 rounded-xl bg-secondary text-on-secondary text-sm font-medium",
                            locked ? "opacity-50 cursor-not-allowed" : "btn-hover",
                        ].join(" ")}
                        onClick={addSelected}
                        disabled={locked || !pending}
                    >
                        Add
                    </button>

                    <div className="w-4"/>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className={[
                            "px-2 py-1 rounded-lg border border-subtle text-xs",
                            locked ? "opacity-50 cursor-not-allowed" : "btn-hover",
                        ].join(" ")}
                        onClick={prev}
                        disabled={locked || !canPrev}
                    >
                        Prev
                    </button>

                    <button
                        type="button"
                        className={[
                            "px-2 py-1 rounded-lg border border-subtle text-xs",
                            locked ? "opacity-50 cursor-not-allowed" : "btn-hover",
                        ].join(" ")}
                        onClick={next}
                        disabled={locked || !canNext}
                    >
                        Next
                    </button>

                    <span className="text-xs text-muted">{pageLabel}</span>
                </div>
            </div>

            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <div className="flex flex-wrap gap-2">
                {value.length === 0 ? (
                    <span className="text-sm text-muted">No diseases selected.</span>
                ) : (
                    value.map((x) => (
                        <span
                            key={x}
                            className="inline-flex items-center gap-2 rounded-full bg-secondary-soft border border-secondary px-3 py-1 text-sm"
                            title={titleizeDiseaseName(x)}
                        >
              <span>{titleizeDiseaseName(x)}</span>
              <button
                  type="button"
                  className={[
                      "text-xs rounded-full border bg-surface border-secondary px-2 py-0.5",
                      locked ? "opacity-50 cursor-not-allowed" : "btn-hover",
                  ].join(" ")}
                  onClick={() => removeOne(x)}
                  disabled={locked}
                  aria-label={`Remove ${titleizeDiseaseName(x)}`}
              >
                Remove
              </button>
            </span>
                    ))
                )}
            </div>
        </div>
    );
}
