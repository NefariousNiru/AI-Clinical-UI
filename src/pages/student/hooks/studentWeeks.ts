// file: src/pages/student/hooks/studentWeeks.ts

import {useCallback, useEffect, useState} from "react";
import type {StudentWeeksResponse} from "../../../lib/types/studentWeeks";
import {listStudentWeeks} from "../../../lib/api/shared/studentWeeks";

type UseStudentWeeksResult = {
    data: StudentWeeksResponse | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

export function useStudentWeeks(): UseStudentWeeksResult {
    const [data, setData] = useState<StudentWeeksResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listStudentWeeks();
            setData(res);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to load weekly workups.";
            setError(msg);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return {data, loading, error, refresh};
}
