// src/routes/admin/hooks/useSystemPrompt.ts
import { useEffect, useState } from "react";
import { getSystemPrompt } from "../../../services/adminApi";

/*
1) Purpose: Load the system prompt once and expose reload.
2) Behavior: Returns { prompt, loading, reload }.
3) Errors: Swallow to UI-friendly fallback; callers can decide what to show.
*/
export function useSystemPrompt() {
    const [prompt, setPrompt] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const r = await getSystemPrompt();
            const sp =
                r && typeof r.systemPrompt === "string" ? r.systemPrompt : "";
            setPrompt(sp);
        } catch {
            setPrompt("(failed to load system prompt)");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const r = await getSystemPrompt();
                if (!alive) return;
                const sp =
                    r && typeof r.systemPrompt === "string" ? r.systemPrompt : "";
                setPrompt(sp);
            } catch {
                if (!alive) return;
                setPrompt("(failed to load system prompt)");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    return { prompt, setPrompt, loading, reload: load };
}
