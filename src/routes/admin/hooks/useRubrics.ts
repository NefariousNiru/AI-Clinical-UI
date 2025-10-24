// src/routes/admin/hooks/useRubrics.ts
import { useEffect, useState } from "react";
import { getAvailableRubrics, getRubric } from "../../../services/adminApi";
import type { RubricPayload } from "../../../types/rubric";

/*
1) Purpose: Manage rubric catalog and on-demand rubric fetch.
2) Behavior: Loads ids once; fetchOne returns payload and sets loading flags.
3) Returns: ids, loading, selectedId, setSelectedId, fetchOne, detail/loadingDetail.
*/
export function useRubrics() {
    const [ids, setIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedId, setSelectedId] = useState<string>("");
    const [detail, setDetail] = useState<RubricPayload | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            try {
                const list = await getAvailableRubrics();
                if (!active) return;
                setIds(list);
                setSelectedId(list[0] ?? "");
            } catch {
                if (!active) return;
                setIds([]);
                setSelectedId("");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    async function fetchOne(rubricId: string) {
        setLoadingDetail(true);
        setDetail(null);
        try {
            const r = await getRubric(rubricId);
            setDetail(r);
        } catch {
            setDetail(null);
        } finally {
            setLoadingDetail(false);
        }
    }

    return {
        ids,
        loading,
        selectedId,
        setSelectedId,
        detail,
        loadingDetail,
        fetchOne,
    };
}
