/** Runtime API base without the /api/v1 suffix. Empty when unset. */
export function getConfiguredApiOrigin(): string {
  return import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";
}

export function isApiConfigured(): boolean {
  return getConfiguredApiOrigin().length > 0;
}
