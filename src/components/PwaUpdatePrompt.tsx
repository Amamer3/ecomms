import { useRegisterSW } from "virtual:pwa-register/react";

import { Button } from "@/components/ui/button";

export function PwaUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  });

  if (!offlineReady && !needRefresh) {
    return null;
  }

  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:right-4"
    >
      <p className="text-sm text-foreground">
        {needRefresh
          ? "A new version of GoMarket is ready."
          : "GoMarket is ready to use offline."}
      </p>
      <div className="flex flex-wrap gap-2">
        {needRefresh ? (
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            Reload
          </Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={dismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
