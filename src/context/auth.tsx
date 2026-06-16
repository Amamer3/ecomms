import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCustomerProfile,
  getMe,
  logout as apiLogout,
} from "@/lib/api";
import { ApiError, clearTokens, isTokenPair, loadTokens, saveTokens } from "@/lib/api/client";
import { reportError } from "@/lib/errors";
import type { LoginResponse, TokenPair } from "@/lib/api/types";
import {
  AUTH_STORAGE_KEY,
  clearSessionFromStorage,
  loadSessionFromStorage,
  customerProfileDisplayName,
  customerProfileNeedsName,
  saveSessionToStorage,
  sessionFromUser,
  type AuthSession,
  type UserRole,
} from "@/lib/auth-storage";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  setSessionFromTokens: (tokens: TokenPair, name?: string) => Promise<void>;
  handleLoginResponse: (response: LoginResponse, name?: string) => Promise<"ok" | "mfa">;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const resolveSessionName = useCallback(
    async (
      user: TokenPair["user"],
      fallback?: string,
    ): Promise<{ name: string; profileComplete: boolean }> => {
      if (user.role === "CUSTOMER") {
        try {
          const profile = await getCustomerProfile();
          return {
            name: customerProfileDisplayName(profile),
            profileComplete: !customerProfileNeedsName(profile),
          };
        } catch {
          /* use fallback */
        }
      }
      return {
        name: fallback ?? user.email?.split("@")[0] ?? user.phone,
        profileComplete: true,
      };
    },
    [],
  );

  const refreshMe = useCallback(async () => {
    const tokens = loadTokens();
    if (!tokens) {
      setSession(null);
      return;
    }
    try {
      const user = await getMe();
      const resolved = await resolveSessionName(user, session?.name);
      const next = sessionFromUser(user, resolved.name, resolved.profileComplete);
      saveSessionToStorage(next);
      setSession(next);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        clearTokens();
        clearSessionFromStorage();
        setSession(null);
        return;
      }
      reportError(e, "auth:refreshMe");
    }
  }, [session?.name, resolveSessionName]);

  const setSessionFromTokens = useCallback(
    async (tokens: TokenPair, name?: string) => {
      saveTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      const resolved = await resolveSessionName(tokens.user, name);
      const displayName = name ?? resolved.name;
      const profileComplete = name ? true : resolved.profileComplete;
      const next = sessionFromUser(tokens.user, displayName, profileComplete);
      saveSessionToStorage(next);
      setSession(next);
    },
    [resolveSessionName],
  );

  useEffect(() => {
    const stored = loadSessionFromStorage();
    const tokens = loadTokens();
    if (!stored || !tokens) {
      setSession(stored);
      setReady(true);
      return;
    }
    setSession(stored);
    void refreshMe().finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- bootstrap once

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY || e.key === null) {
        setSession(loadSessionFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLoginResponse = useCallback(
    async (response: LoginResponse, name?: string): Promise<"ok" | "mfa"> => {
      if (isTokenPair(response)) {
        await setSessionFromTokens(response, name);
        return "ok";
      }
      return "mfa";
    },
    [setSessionFromTokens],
  );

  const logout = useCallback(async () => {
    const tokens = loadTokens();
    if (tokens) {
      try {
        await apiLogout(tokens.refreshToken);
      } catch {
        /* ignore */
      }
    }
    clearTokens();
    clearSessionFromStorage();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, ready, setSessionFromTokens, handleLoginResponse, logout, refreshMe }),
    [session, ready, setSessionFromTokens, handleLoginResponse, logout, refreshMe],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

/** @deprecated Use API login flows instead */
export function useLegacyLoginShim(): never {
  throw new Error("Mock login removed — use OTP or password login via API");
}

export type { UserRole };
