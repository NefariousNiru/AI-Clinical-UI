// src/routes/admin/hooks/useSubmissions.ts
import { useEffect, useState } from "react";
import { getSubmissions } from "../../../services/adminApi";
import type { StudentSubmission } from "../../../types/admin";

/*
1) Purpose: Paginated fetch of student submissions.
2) Params: { page, limit } with sane defaults and guards in the hook.
3) Returns: items, total, loading, setPage; page/limit remain owned by the hook.
*/
export function useSubmissions(initialPage = 1, pageSize = 10) {
    const [page, setPage] = useState<number>(initialPage);
    const limit = pageSize;
    const [items, setItems] = useState<StudentSubmission[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            try {
                const resp = await getSubmissions({ page, limit });
                if (!active) return;
                const arr = Array.isArray(resp?.items) ? resp.items : [];
                const tot = typeof resp?.total === "number" ? resp.total : 0;
                setItems(arr);
                setTotal(tot);
            } catch {
                if (!active) return;
                setItems([]);
                setTotal(0);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [page, limit]);

    return { items, total, page, limit, loading, setPage };
}
