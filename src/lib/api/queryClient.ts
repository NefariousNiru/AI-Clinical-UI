// file: src/lib/api/queryClient.ts

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount) => {
				// You can make this smarter by inspecting ApiError.status (401/403 should not retry)
				return failureCount < 2;
			},
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
			refetchOnMount: false,
		},
		mutations: {
			retry: 0,
		},
	},
});
