// file: src/pages/admin/hooks/tests.ts

import { useEffect, useState } from "react";
import {
    fetchTestUiConfig,
    listStudentSubmissions,
    chat,
} from "../../../lib/api/admin/test";
import { ApiError } from "../../../lib/api/http";
import type {
    PopulateUI,
    TestSubmission,
} from "../../../lib/types/test";
import type { ProblemFeedback } from "../../../lib/types/feedback";

/* ---------------------------------------------------------
 * Error normalization for admin test APIs
 * --------------------------------------------------------- */

function errorMessage(e: unknown): string {
    if (e instanceof ApiError) return e.message || "Request failed.";
    if (e instanceof Error) return e.message || "Request failed.";
    return "Request failed.";
}

/* ---------------------------------------------------------
 * Hook: useTestUI
 *
 * Wraps /api/v1/admin/test/populate_ui
 *  - Loads initial system prompt + modelNames once on mount.
 *  - Keeps a controlled systemPrompt + selectedModel in local state.
 *  - Selected model is kept stable if still present after refresh.
 * --------------------------------------------------------- */

export type UseTestUiResult = {
    systemPrompt: string;
    setSystemPrompt: (value: string) => void;
    modelNames: string[];
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    loading: boolean;
    error?: string;
};

export function useTestUI(): UseTestUiResult {
    const [systemPrompt, setSystemPrompt] = useState<string>("");
    const [modelNames, setModelNames] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const cfg: PopulateUI = await fetchTestUiConfig();
                if (cancelled) return;

                setSystemPrompt(cfg.systemPrompt ?? "");
                setModelNames(cfg.modelNames ?? []);

                setSelectedModel((prev) => {
                    if (prev && cfg.modelNames.includes(prev)) return prev;
                    return cfg.modelNames[0] ?? "";
                });

                setError(undefined);
            } catch (e: unknown) {
                if (cancelled) return;

                const msg =
                    e instanceof Error && e.message.trim()
                        ? e.message
                        : "Failed to load test configuration.";
                setError(msg);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        systemPrompt,
        setSystemPrompt,
        modelNames,
        selectedModel,
        setSelectedModel,
        loading,
        error,
    };
}

/* ---------------------------------------------------------
 * Hook: useTestSubmissions
 *
 * Wraps:
 *   GET /api/v1/admin/test/submission?page=...&limit=...
 *   -> TestSubmissionResponse { items, page, limit, total, pages }
 *
 * Provides paginated list for the TestsPage sidebar.
 * --------------------------------------------------------- */

export type UseTestSubmissionsResult = {
    items: TestSubmission[];
    total: number;
    page: number;
    limit: number;
    loading: boolean;
    setPage: (page: number) => void;
};

export function useTestSubmissions(
    initialPage = 1,
    pageSize = 10,
): UseTestSubmissionsResult {
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

/* ---------------------------------------------------------
 * Hook: useTestGrader
 *
 * Wraps POST /api/v1/admin/test/chat
 *
 * - Owns sending/feedback/outputMsg/gradedSubmission.
 * - Handles "no submission selected" / "no model" UX messages.
 * --------------------------------------------------------- */

type GradeArgs = {
    submission: TestSubmission | null;
    systemPrompt: string;
    modelName: string;
};

export type UseTestGraderResult = {
    sending: boolean;
    feedback: ProblemFeedback[] | null;
    outputMsg: string;
    gradedSubmission: TestSubmission | null;
    grade: (args: GradeArgs) => Promise<void>;
    clear: () => void;
};

export function useTestGrader(): UseTestGraderResult {
    const [feedback, setFeedback] = useState<ProblemFeedback[] | null>(null);
    const [outputMsg, setOutputMsg] = useState<string>("");
    const [sending, setSending] = useState<boolean>(false);
    const [gradedSubmission, setGradedSubmission] =
        useState<TestSubmission | null>(null);

    async function grade({
                             submission,
                             systemPrompt,
                             modelName,
                         }: GradeArgs): Promise<void> {
        // Guard: no submission selected
        if (!submission) {
            setFeedback(null);
            setOutputMsg(
                "Select a submission from the list on the right, then press Send.",
            );
            return;
        }

        // Guard: no model selected
        if (!modelName) {
            setFeedback(null);
            setOutputMsg("No model selected.");
            return;
        }

        setSending(true);
        setFeedback(null);
        setOutputMsg("Processing…");
        setGradedSubmission(submission);

        try {
            const resp = await chat({
                testSubmission: submission,
                systemPrompt,
                modelName,
            });

            setFeedback(resp.results);
            setOutputMsg("");
        } catch (e: unknown) {
            setFeedback(null);
            setOutputMsg(errorMessage(e));
        } finally {
            setSending(false);
        }
    }

    function clear(): void {
        setFeedback(null);
        setOutputMsg("");
        setGradedSubmission(null);
    }

    return {
        sending,
        feedback,
        outputMsg,
        gradedSubmission,
        grade,
        clear,
    };
}
