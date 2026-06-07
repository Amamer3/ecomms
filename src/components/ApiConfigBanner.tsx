import { isApiConfigured } from "@/lib/env";

/** Shown when VITE_API_URL was not set at build time. */
export function ApiConfigBanner() {
  if (import.meta.env.PROD && isApiConfigured()) return null;
  if (isApiConfigured()) return null;

  return (
    <div
      role="alert"
      className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive"
    >
      API not configured: set <code className="font-mono text-xs">VITE_API_URL</code> in{" "}
      <code className="font-mono text-xs">.env</code> (local) or your hosting build settings, then
      rebuild.
    </div>
  );
}
