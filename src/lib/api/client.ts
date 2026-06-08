import { getConfiguredApiOrigin, isApiConfigured } from "@/lib/env";
import type { ErrorResponse, LoginResponse, MfaLoginChallenge, TokenPair } from "./types";

const TOKEN_KEY = "randys_tokens";

export function getApiBaseUrl(): string {
  if (!isApiConfigured()) {
    throw new Error(
      "VITE_API_URL is not configured. Set it in .env for local dev or in your hosting build environment.",
    );
  }
  return `${getConfiguredApiOrigin()}/api/v1`;
}

function buildApiUrl(path: string, query?: RequestOptions["query"]): URL {
  let url: URL;
  try {
    url = new URL(`${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`);
  } catch {
    throw new ApiError(
      503,
      "Invalid VITE_API_URL. Use a full origin such as https://api.example.com",
      { error: "CONFIG", message: "Invalid VITE_API_URL" },
    );
  }
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url;
}

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

export function loadTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredTokens>;
    if (typeof p.accessToken === "string" && typeof p.refreshToken === "string") return p as StoredTokens;
    return null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: StoredTokens): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  body: ErrorResponse | null;

  constructor(status: number, message: string, body: ErrorResponse | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function formatApiErrorMessage(body: ErrorResponse | null, fallback: string): string {
  if (!body) return fallback;
  const details = body.details;
  if (Array.isArray(details) && details.length > 0) {
    const first = details[0] as { message?: string; path?: string };
    if (typeof first.message === "string") return first.message;
  }
  return body.message || fallback;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ErrorResponse | null = null;
  try {
    body = (await res.json()) as ErrorResponse;
  } catch {
    /* ignore */
  }
  const message = formatApiErrorMessage(body, res.statusText);
  return new ApiError(res.status, message, body);
}

let refreshPromise: Promise<StoredTokens | null> | null = null;

async function refreshTokens(refreshToken: string): Promise<StoredTokens | null> {
  const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = (await res.json()) as TokenPair;
  const next = { accessToken: data.accessToken, refreshToken: data.refreshToken };
  saveTokens(next);
  return next;
}

export type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
};

function isFetchNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error && error.message.toLowerCase().includes("fetch")) return true;
  return false;
}

function toRequestError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isFetchNetworkError(error)) {
    return new ApiError(0, "Unable to reach the server. Check your connection and try again.", {
      error: "NETWORK",
      message: "Network request failed",
    });
  }
  const message = error instanceof Error ? error.message : "Request failed";
  return new ApiError(0, message, { error: "REQUEST", message });
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, query, headers: extraHeaders } = options;

  try {
    const url = buildApiUrl(path, query);

    const headers: Record<string, string> = { accept: "application/json", ...extraHeaders };
    if (body !== undefined) headers["content-type"] = "application/json";

    let tokens = auth ? loadTokens() : null;
    if (auth && tokens) headers.authorization = `Bearer ${tokens.accessToken}`;

    const doFetch = async (t?: StoredTokens | null) => {
      const h = { ...headers };
      if (auth && t) h.authorization = `Bearer ${t.accessToken}`;
      return fetch(url.toString(), {
        method,
        headers: h,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    };

    let res = await doFetch(tokens);

    if (auth && res.status === 401 && tokens?.refreshToken) {
      if (!refreshPromise) {
        refreshPromise = refreshTokens(tokens.refreshToken).finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;
      if (refreshed) {
        tokens = refreshed;
        res = await doFetch(refreshed);
      }
    }

    if (!res.ok) throw await parseError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (error) {
    throw toRequestError(error);
  }
}

export function isTokenPair(data: LoginResponse): data is TokenPair {
  return "accessToken" in data && "refreshToken" in data;
}

export function isMfaChallenge(data: LoginResponse): data is MfaLoginChallenge {
  return (
    "mfaRequired" in data &&
    data.mfaRequired === true &&
    "mfaToken" in data &&
    typeof data.mfaToken === "string" &&
    data.mfaToken.length > 0
  );
}

export function isMfaEnrollment(challenge: MfaLoginChallenge): boolean {
  return typeof challenge.otpauthUri === "string" && challenge.otpauthUri.length > 0;
}

export function parseMoney(value: string | number): number {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}
