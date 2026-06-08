import { QueryCache, QueryClient } from "@tanstack/react-query";
import { isRetryableError, reportError } from "@/lib/errors";

export function createAppQueryClient() {
  const isServer = typeof window === "undefined";

  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        reportError(error, `query:${String(query.queryHash)}`);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (!isRetryableError(error)) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: import.meta.env.PROD,
        // Catalog/auth queries use the public API — run in the browser only so SSR
        // never crashes when VITE_API_URL is missing or the backend is unreachable.
        enabled: !isServer,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
