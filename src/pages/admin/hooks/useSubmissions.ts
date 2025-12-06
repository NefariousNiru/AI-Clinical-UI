// file: src/pages/admin/hooks/useSubmissions.ts

import { useEffect, useState } from "react";
import { listStudentSubmissions } from "../../../lib/api/admin/test";
import type { TestSubmission } from "../../../lib/types/test.ts";

type UseSubmissionsResult = {
    items: TestSubmission[];
    total: number;
    page: number;
    limit: number;
    loading: boolean;
    setPage: (page: number) => void;
};

/**
 * Paginated fetch of synthetic test submissions.
 *
 * Backed by:
 *   GET /api/v1/admin/test/submission?page=...&limit=...
 *   -> TestSubmissionResponse { items, page, limit, total, pages }
 */
export function useSubmissions(
    initialPage = 1,
    pageSize = 10,
): UseSubmissionsResult {
    const [page, setPage] = useState<number>(initialPage);
    const limit = pageSize;

    const [items, setItems] = useState<TestSubmission[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let active = true;

        async function load(): Promise<void> {
            setLoading(true);
            try {
                const resp = await listStudentSubmissions(page, limit);
                if (!active) return;

                const arr: TestSubmission[] = Array.isArray(resp.items)
                    ? resp.items
                    : [];
                const tot: number =
                    typeof resp.total === "number" ? resp.total : 0;

                setItems(arr);
                setTotal(tot);
            } catch {
                if (!active) return;
                setItems([]);
                setTotal(0);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            active = false;
        };
    }, [page, limit]);

    return { items, total, page, limit, loading, setPage };
}
