import { ApiError } from "@/lib/api/client";

const NETWORK_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) return error.status === 0;
  if (error instanceof TypeError) return true;
  if (error instanceof Error && error.message.toLowerCase().includes("fetch")) return true;
  return false;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.status === 0) return true;
    if (error.status >= 500) return true;
    if (error.status === 429) return true;
    return false;
  }
  return isNetworkError(error);
}

export function getErrorMessage(error: unknown, fallback = GENERIC_MESSAGE): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return NETWORK_MESSAGE;
    return error.message || fallback;
  }
  if (isNetworkError(error)) return NETWORK_MESSAGE;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

/** Friendly copy for sign-in / OTP flows — avoids raw "Unauthorized" from the API. */
export function getAuthErrorMessage(error: unknown, fallback = "Sign in failed"): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return NETWORK_MESSAGE;
    if (error.status === 401) {
      return "Invalid email or password. Check your credentials and try again.";
    }
    if (error.status === 403) {
      return "This account cannot sign in here. Use customer sign-in for shopper accounts.";
    }
    if (error.status === 429) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    const msg = error.message?.trim();
    if (msg && msg.toLowerCase() !== "unauthorized") return msg;
    return fallback;
  }
  return getErrorMessage(error, fallback);
}

/** Expected client errors (e.g. wrong password) — not worth logging as crashes. */
export function isExpectedClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

export function reportError(error: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : "[error]";
  if (import.meta.env.DEV) {
    console.error(prefix, error);
    return;
  }
  console.error(prefix, getErrorMessage(error));
}
