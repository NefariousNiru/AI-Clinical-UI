// file: src/pages/student/hooks/diseaseSearch.ts

import { useEffect, useMemo, useRef, useState } from "react";
import { searchDiseases } from "../../../lib/api/shared/disease.ts";

type State = {
	data: string[];
	loading: boolean;
	error: string | null;
};

export function useDiseaseSearch(rawQuery: string) {
	const limit = 10;
	const debounceMs = 250;

	const query = useMemo(() => (rawQuery ?? "").trim(), [rawQuery]);
	const cacheRef = useRef<Map<string, string[]>>(new Map());
	const lastReqIdRef = useRef(0);

	const [state, setState] = useState<State>({
		data: [],
		loading: false,
		error: null,
	});

	useEffect(() => {
		// Backend enforces min length 3
		if (query.length < 3) {
			setState({ data: [], loading: false, error: null });
			return;
		}

		const cached = cacheRef.current.get(`${query}::${limit}`);
		if (cached) {
			setState({ data: cached, loading: false, error: null });
			return;
		}

		const reqId = ++lastReqIdRef.current;

		setState((s) => ({ ...s, loading: true, error: null }));

		const t = window.setTimeout(() => {
			searchDiseases(query, limit)
				.then((xs) => {
					if (reqId !== lastReqIdRef.current) return;
					cacheRef.current.set(`${query}::${limit}`, xs);
					setState({ data: xs, loading: false, error: null });
				})
				.catch((e) => {
					if (reqId !== lastReqIdRef.current) return;
					const msg =
						e instanceof Error ? e.message : "Failed to load disease suggestions";
					setState({ data: [], loading: false, error: msg });
				});
		}, debounceMs);

		return () => {
			window.clearTimeout(t);
		};
	}, [query, limit, debounceMs]);

	return state; // { data, loading, error }
}
