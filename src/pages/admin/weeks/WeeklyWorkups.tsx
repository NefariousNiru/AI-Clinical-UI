// file: src/pages/admin/weeks/WeeklyWorkups.tsx

import {useEffect, useMemo, useState} from "react";
import type {Semester} from "../../../lib/types/semester";
import type {WeeklyWorkupListItem, WeeklyWorkupStatus} from "../../../lib/types/weeks";
import {isoDateToUnixEnd, isoDateToUnixStart} from "../../../lib/utils/functions";
import {useWeeklyWorkups, useWeeklyWorkupDetail, useWeeklyWorkupMutations} from "../hooks/weeks";
import WeeksListCard from "./WeeksListCard";
import WeekDetailsCard from "./WeekDetailsCard";

type Mode = "empty" | "view" | "edit" | "add";

export default function WeeklyWorkups({semester}: { semester: Semester | null }) {
    const semesterId = semester?.id ?? null;
    const canAdd = Boolean(semester?.isCurrent);

    const {weeks, loading: listLoading, error: listError, refresh: refreshList} =
        useWeeklyWorkups(semesterId);

    const [mode, setMode] = useState<Mode>("empty");
    const [selectedWeekId, setSelectedWeekId] = useState<number | null>(null);

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [resetToken, setResetToken] = useState(0);

    const selectedWeekSummary: WeeklyWorkupListItem | null = useMemo(() => {
        if (!selectedWeekId) return null;
        return weeks.find((w) => w.id === selectedWeekId) ?? null;
    }, [weeks, selectedWeekId]);

    const {detail, loading: detailLoading, error: detailError, refresh: refreshDetail} =
        useWeeklyWorkupDetail(selectedWeekId);

    const {create, update, saving, error: mutationError} = useWeeklyWorkupMutations();

    useEffect(() => {
        // Semester changed - clear right panel selection and banners.
        setMode("empty");
        setSelectedWeekId(null);
        setSuccessMessage(null);
        setResetToken((x) => x + 1);
    }, [semesterId]);

    function onSelectWeek(weekId: number, status: WeeklyWorkupStatus) {
        setSuccessMessage(null);
        setSelectedWeekId(weekId);
        setMode(status === "locked" ? "edit" : "view");
    }

    function onAddWeek() {
        if (!canAdd) {
            setSuccessMessage("Add Week is only allowed for the current semester.");
            return;
        }
        setSuccessMessage(null);
        setSelectedWeekId(null);
        setMode("add");
        setResetToken((x) => x + 1);
    }

    async function onSubmitAdd(payload: {
        weekNo: number;
        patientName: string;
        startIso: string;
        endIso: string;
        diseaseNames: string[];
    }) {
        if (!semester) return;

        const body = {
            semesterName: semester.name,
            semesterYear: String(semester.year),
            weekNo: payload.weekNo,
            patientName: payload.patientName,
            start: isoDateToUnixStart(payload.startIso),
            end: isoDateToUnixEnd(payload.endIso),
            diseaseNames: payload.diseaseNames,
        };

        await create(body);
        await refreshList();

        setSuccessMessage("Week added.");
        setMode("add");
        setSelectedWeekId(null);
        setResetToken((x) => x + 1);
    }

    async function onSubmitEdit(payload: {
        weekNo: number;
        patientName: string;
        startIso: string;
        endIso: string;
        diseaseNames: string[];
    }) {
        if (!semester) return;
        if (!selectedWeekId) return;

        const body = {
            semesterName: semester.name,
            semesterYear: String(semester.year),
            weekNo: payload.weekNo,
            patientName: payload.patientName,
            start: isoDateToUnixStart(payload.startIso),
            end: isoDateToUnixEnd(payload.endIso),
            diseaseNames: payload.diseaseNames,
        };

        await update(selectedWeekId, body);
        await refreshList();
        await refreshDetail();

        setSuccessMessage("Changes saved.");
        setMode("edit");
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
                <WeeksListCard
                    weeks={weeks}
                    loading={listLoading}
                    error={semester ? listError : null}
                    activeWeekId={selectedWeekId}
                    canAdd={canAdd}
                    onAddWeek={onAddWeek}
                    onSelectWeek={onSelectWeek}
                />

                {!semester ? (
                    <div className="mt-3 text-sm text-muted">
                        Select a semester to load weekly workups.
                    </div>
                ) : null}
            </div>

            <div>
                <WeekDetailsCard
                    mode={semester ? mode : "empty"}
                    semester={semester}
                    selectedWeekSummary={selectedWeekSummary}
                    detail={detail}
                    loading={detailLoading}
                    error={detailError}
                    saving={saving}
                    mutationError={mutationError}
                    successMessage={successMessage}
                    resetToken={resetToken}
                    onSubmitAdd={onSubmitAdd}
                    onSubmitEdit={onSubmitEdit}
                />
            </div>
        </div>
    );
}
