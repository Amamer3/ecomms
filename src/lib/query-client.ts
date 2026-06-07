import { QueryClient } from "@tanstack/react-query";

export function createAppQueryClient() {
  const isServer = typeof window === "undefined";

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
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
