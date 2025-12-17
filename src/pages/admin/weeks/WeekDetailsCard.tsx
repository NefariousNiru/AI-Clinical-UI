// file: src/pages/admin/weeks/WeekDetailsCard.tsx

import {useEffect, useMemo, useState} from "react";
import type {Semester} from "../../../lib/types/semester";
import type {WeeklyWorkupDetail, WeeklyWorkupListItem} from "../../../lib/types/weeks";
import {unixToIsoDate, titleizeDiseaseName} from "../../../lib/utils/functions";
import RubricIdPicker from "./RubricIdPicker";

type Mode = "empty" | "view" | "edit" | "add";

type Props = {
    mode: Mode;
    semester: Semester | null;

    selectedWeekSummary: WeeklyWorkupListItem | null;
    detail: WeeklyWorkupDetail | null;
    loading: boolean;
    error: string | null;

    saving: boolean;
    mutationError: string | null;

    successMessage: string | null;
    resetToken: number; // bump to reset add form after a successful create

    onSubmitAdd: (payload: {
        weekNo: number;
        patientName: string;
        startIso: string;
        endIso: string;
        diseaseNames: string[];
    }) => Promise<void>;

    onSubmitEdit: (payload: {
        weekNo: number;
        patientName: string;
        startIso: string;
        endIso: string;
        diseaseNames: string[];
    }) => Promise<void>;
};

function fieldLabel(text: string) {
    return <div className="text-xs font-semibold text-muted">{text}</div>;
}

export default function WeekDetailsCard({
                                            mode,
                                            semester,
                                            selectedWeekSummary,
                                            detail,
                                            loading,
                                            error,
                                            saving,
                                            mutationError,
                                            successMessage,
                                            resetToken,
                                            onSubmitAdd,
                                            onSubmitEdit,
                                        }: Props) {
    const canRenderForm = mode !== "empty";

    const initial = useMemo(() => {
        if (mode === "add") {
            return {
                semesterName: semester?.name ?? "",
                semesterYear: semester ? String(semester.year) : "",
                weekNo: 0,
                patientName: "",
                startIso: "",
                endIso: "",
                diseaseNames: [] as string[],
            };
        }

        if (detail) {
            return {
                semesterName: detail.semesterName,
                semesterYear: detail.semesterYear,
                weekNo: detail.weekNo,
                patientName: detail.patientName,
                startIso: unixToIsoDate(detail.start),
                endIso: unixToIsoDate(detail.end),
                diseaseNames: detail.diseaseNames ?? [],
            };
        }

        return {
            semesterName: "",
            semesterYear: "",
            weekNo: selectedWeekSummary?.weekNo ?? 0,
            patientName: selectedWeekSummary?.patientName ?? "",
            startIso: selectedWeekSummary ? unixToIsoDate(selectedWeekSummary.start) : "",
            endIso: selectedWeekSummary ? unixToIsoDate(selectedWeekSummary.end) : "",
            diseaseNames: [] as string[],
        };
        // resetToken intentionally included so Add form clears after successful create
    }, [mode, semester, detail, selectedWeekSummary, resetToken]);

    const [weekNo, setWeekNo] = useState<number>(initial.weekNo);
    const [patientName, setPatientName] = useState<string>(initial.patientName);
    const [startIso, setStartIso] = useState<string>(initial.startIso);
    const [endIso, setEndIso] = useState<string>(initial.endIso);
    const [diseaseNames, setDiseaseNames] = useState<string[]>(initial.diseaseNames);

    useEffect(() => {
        setWeekNo(initial.weekNo);
        setPatientName(initial.patientName);
        setStartIso(initial.startIso);
        setEndIso(initial.endIso);
        setDiseaseNames(initial.diseaseNames);
    }, [initial]);

    const title =
        mode === "add" ? "Add Week" : mode === "edit" ? "Edit Week" : mode === "view" ? "View Week" : "Week";

    const viewOnly = mode === "view";
    const addOnly = mode === "add";
    const editOnly = mode === "edit";

    const canAdd = Boolean(semester?.isCurrent);
    const addDisabledByPolicy = addOnly && !canAdd;

    const submitDisabled = saving || loading || !semester || addDisabledByPolicy;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (mode === "add") {
            await onSubmitAdd({weekNo, patientName, startIso, endIso, diseaseNames});
        } else if (mode === "edit") {
            await onSubmitEdit({weekNo, patientName, startIso, endIso, diseaseNames});
        }
    }

    function disabledFieldClass(disabled: boolean): string {
        return disabled ? "opacity-60" : "";
    }

    return (
        <div className="rounded-3xl border border-subtle p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {mode === "add" ? (
                        <p className="text-sm text-muted">
                            Week number must be greater than the previous week.
                            {!canAdd ? " Add is only allowed for the current semester." : ""}
                        </p>
                    ) : (
                        <p className="text-sm text-muted">
                            {mode === "edit" ? "Only future weeks are editable." : "Past/current weeks are view-only."}
                        </p>
                    )}
                </div>
            </div>

            {!canRenderForm ? (
                <div className="mt-4 text-sm text-muted">
                    Select a week from the left, or click <span className="font-medium text-accent">Add Week</span>.
                </div>
            ) : (
                <div className="mt-4">
                    {successMessage ? (
                        <div className="mb-3 rounded-xl border border-subtle bg-surface-subtle px-3 py-2 text-sm">
                            {successMessage}
                        </div>
                    ) : null}

                    {error ? <div className="mb-3 text-sm text-danger">{error}</div> : null}
                    {mutationError ? <div className="mb-3 text-sm text-danger">{mutationError}</div> : null}

                    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className={"flex flex-col gap-1 " + disabledFieldClass(true)}>
                                {fieldLabel("Semester")}
                                <input
                                    className="bg-input border border-subtle rounded-xl px-3 py-2 text-sm"
                                    value={
                                        addOnly
                                            ? `${semester?.name ?? ""} ${semester ? String(semester.year) : ""}`.trim()
                                            : `${initial.semesterName} ${initial.semesterYear}`.trim()
                                    }
                                    disabled
                                />
                            </div>

                            <div className={"flex flex-col gap-1 " + disabledFieldClass(!addOnly)}>
                                {fieldLabel("Week No")}
                                <input
                                    className="bg-input border border-subtle rounded-xl px-3 py-2 text-sm"
                                    type="number"
                                    value={weekNo || ""}
                                    onChange={(e) => setWeekNo(Number(e.target.value))}
                                    disabled={!addOnly || submitDisabled}
                                    placeholder="e.g. 1"
                                />
                                {addOnly ? <div className="text-xs text-muted">Must be greater than the previous
                                    week.</div> : null}
                            </div>

                            <div className="flex flex-col gap-1">
                                {fieldLabel("Patient Name")}
                                <input
                                    className="bg-input border border-subtle rounded-xl px-3 py-2 text-sm"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    disabled={viewOnly || submitDisabled}
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                {fieldLabel("Start Date")}
                                <input
                                    className="bg-input border border-subtle rounded-xl px-3 py-2 text-sm"
                                    type="date"
                                    value={startIso}
                                    onChange={(e) => setStartIso(e.target.value)}
                                    disabled={viewOnly || submitDisabled}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                {fieldLabel("End Date")}
                                <input
                                    className="bg-input border border-subtle rounded-xl px-3 py-2 text-sm"
                                    type="date"
                                    value={endIso}
                                    onChange={(e) => setEndIso(e.target.value)}
                                    disabled={viewOnly || submitDisabled}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            {fieldLabel("Diseases")}
                            {viewOnly ? (
                                <div className="flex flex-wrap gap-2">
                                    {(detail?.diseaseNames ?? []).length === 0 ? (
                                        <span className="text-sm text-muted">No diseases configured.</span>
                                    ) : (
                                        (detail?.diseaseNames ?? []).map((x) => (
                                            <span
                                                key={x}
                                                className="inline-flex items-center rounded-full bg-secondary-soft border border-secondary px-3 py-1 text-sm"
                                                title={titleizeDiseaseName(x)}
                                            >
                                                {titleizeDiseaseName(x)}
                                            </span>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <RubricIdPicker
                                    value={diseaseNames}
                                    onChange={setDiseaseNames}
                                    disabled={submitDisabled}
                                />
                            )}
                        </div>

                        {viewOnly ? null : (
                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    className={[
                                        "px-4 py-2 rounded-xl bg-accent text-on-accent text-sm font-medium",
                                        submitDisabled ? "opacity-50 cursor-not-allowed" : "btn-hover",
                                    ].join(" ")}
                                    disabled={submitDisabled}
                                    title={addDisabledByPolicy ? "Add is only allowed for the current semester." : undefined}
                                >
                                    {saving ? "Saving..." : editOnly ? "Save Changes" : "Create Week"}
                                </button>

                                <div className="text-xs text-muted">
                                    Dates are saved as US-Eastern with Daylight Saving: start at 12:00 AM, end at 11:59 PM.
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}
