/** Runtime API base without the /api/v1 suffix. Empty when unset or invalid. */
export function getConfiguredApiOrigin(): string {
  const raw = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "") ?? "";
  if (!raw) return "";
  // Allow host-only values like "api.example.com" from env files.
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
  return raw;
}

export function isApiConfigured(): boolean {
  return getConfiguredApiOrigin().length > 0;
}
