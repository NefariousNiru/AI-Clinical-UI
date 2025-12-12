// file: src/pages/admin/SemesterDropdown.tsx

import { useEffect, type ChangeEvent } from "react";
import { useSemesterSelection } from "./hooks/semester";
import type { Semester } from "../../lib/types/semester";

type SemesterDropdownProps = {
    onChange?: (semester: Semester | null) => void;
    compact?: boolean;
};

export default function SemesterDropdown({
                                             onChange,
                                         }: SemesterDropdownProps) {
    const {
        options,
        selected,
        resolvedSemester,
        loading,
        error,
        setSelectedKey,
    } = useSemesterSelection();

    // Bubble up changes whenever the resolved semester changes
    useEffect(() => {
        if (!onChange) return;
        onChange(resolvedSemester ?? null);
    }, [onChange, resolvedSemester]);

    const selectClass = [
        "block w-full",
        "rounded-md border border-subtle bg-surface px-2 py-2",
        "text-xs md:text-xs text-primary",
        "focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent",
        "disabled:opacity-60 disabled:cursor-not-allowed",
    ].join(" ");

    function handleChange(e: ChangeEvent<HTMLSelectElement>): void {
        const value = e.target.value;
        if (!value) return;
        void setSelectedKey(value);
    }

    const hasSelection = !!selected && options.length > 0;

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-1 min-w-[130px]">
                <select
                    id="semester-combo"
                    className={selectClass}
                    value={hasSelection ? selected!.key : ""}
                    onChange={handleChange}
                    disabled={loading || !hasSelection}
                >
                    {!hasSelection ? (
                        <option value="">Loading...</option>
                    ) : null}
                    {options.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Status / error text */}
            <div className="min-h-[1.25rem]">
                {loading ? (
                    <p className="text-[11px] text-muted">
                        Loading semester…
                    </p>
                ) : error ? (
                    <p className="text-[11px] text-danger">{error}</p>
                ) : resolvedSemester ? (
                    <p className="text-[11px] text-muted px-1">
                        Showing{" "}
                        <span className="font-medium">
                            {resolvedSemester.name}{" "}
                            {normalizeYear(resolvedSemester.year)}
                        </span>
                        .
                    </p>
                ) : null}
            </div>
        </div>
    );
}

function normalizeYear(year: Semester["year"]): number {
    if (typeof year === "number") return year;
    const parsed = Number(year);
    return Number.isNaN(parsed) ? new Date().getFullYear() : parsed;
}
