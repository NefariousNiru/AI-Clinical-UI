// file: src/pages/shared/hooks/mrpToolStatus.ts

import { useCallback, useEffect, useState } from "react";
import { fetchMrpToolStatus } from "../../../lib/api/shared/settings";

type UseMrpToolStatusResult = {
	enabled: boolean;
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
};

export function useMrpToolStatus(active: boolean): UseMrpToolStatusResult {
	const [enabled, setEnabled] = useState(false);
	const [loading, setLoading] = useState(false); // start false; only true when active
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const v = await fetchMrpToolStatus();
			setEnabled(v);
		} catch (e) {
			setEnabled(false);
			setError(e instanceof Error ? e.message : "Failed to load MRP tool status.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!active) return;
		void refresh();
	}, [active, refresh]);

	return { enabled, loading, error, refresh };
}
