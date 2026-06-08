import { useSyncExternalStore } from "react";

/** False during SSR and the first client render — avoids React Query SSR/client UI mismatches. */
export function useClientReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
