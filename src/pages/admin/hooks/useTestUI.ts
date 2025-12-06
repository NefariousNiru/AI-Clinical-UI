// file: src/pages/admin/hooks/useTestUI.ts

import { useEffect, useState } from "react";
import { fetchTestUiConfig } from "../../../lib/api/admin/test";
import type { PopulateUI } from "../../../lib/types/test.ts";

type UseTestUiResult = {
    systemPrompt: string;
    setSystemPrompt: (value: string) => void;
    modelNames: string[];
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    loading: boolean;
    error?: string;
};

/**
 * Hook that wraps /api/v1/admin/test/populate_ui.
 *
 * - Loads initial system prompt + modelNames once on mount.
 * - Keeps a controlled systemPrompt + selectedModel in local state.
 * - Selected model is kept stable if still present after refresh.
 */
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
