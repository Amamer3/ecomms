export const APP_NAME = "GoMarket";

export const APP_TAGLINE = "Fresh groceries & essentials, delivered";

/** Page title suffix, e.g. "Shop — GoMarket" */
export function pageTitle(segment: string): string {
  return `${segment} — ${APP_NAME}`;
}
