// src/routes/admin/hooks/useModels.ts
import { useEffect, useState } from "react";
import { getAvailableModels } from "../../../services/adminApi";

/*
1) Purpose: Load available model ids and expose current selection.
2) Behavior: First model becomes default selection if available.
3) Returns: models, loading, model, setModel.
*/
export function useModels() {
    const [models, setModels] = useState<string[]>([]);
    const [model, setModel] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            try {
                const list = await getAvailableModels();
                if (!active) return;
                setModels(list);
                setModel(list[0] ?? "");
            } catch {
                if (!active) return;
                setModels([]);
                setModel("");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    return { models, model, setModel, loading };
}
