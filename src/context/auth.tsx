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
  AUTH_STORAGE_KEY,
  type AuthSession,
  type UserRole,
  clearSessionFromStorage,
  loadSessionFromStorage,
  roleLabel,
  saveSessionToStorage,
} from "@/lib/auth-storage";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  login: (input: { name: string; email: string; role: UserRole }) => void;
  logout: () => void;
};

const Ctx = createContext<AuthContextValue | null>(null);

function defaultDisplayName(role: UserRole): string {
  return roleLabel(role);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadSessionFromStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY || e.key === null) {
        setSession(loadSessionFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((input: { name: string; email: string; role: UserRole }) => {
    const next: AuthSession = {
      id: crypto.randomUUID(),
      email: input.email.trim(),
      name: input.name.trim() || defaultDisplayName(input.role),
      role: input.role,
      createdAt: new Date().toISOString(),
    };
    saveSessionToStorage(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    clearSessionFromStorage();
    setSession(null);
  }, []);

  const value = useMemo(() => ({ session, ready, login, logout }), [session, ready, login, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- useAuth must live next to AuthProvider
export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
