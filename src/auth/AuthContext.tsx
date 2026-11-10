import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setSessionExpiredHandler, type User } from "../api/client";
import { tokenStore } from "./tokenStore";

type AuthState = {
  status: "loading" | "signedOut" | "signedIn";
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState["status"]>("loading");
  const [user, setUser] = useState<User | null>(null);

  const expire = useCallback(() => {
    setUser(null);
    setStatus("signedOut");
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(expire);
    (async () => {
      if (!(await tokenStore.get())) return expire();
      try {
        setUser(await api.me());
        setStatus("signedIn");
      } catch {
        // 401 já foi tratado pelo handler; erro de rede mantém sessão local
        if (await tokenStore.get()) setStatus("signedIn");
        else expire();
      }
    })();
  }, [expire]);

  const signIn = useCallback(async (email: string, password: string) => {
    await api.login(email, password);
    setUser(await api.me());
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    await api.logout();
    expire();
  }, [expire]);

  const value = useMemo(() => ({ status, user, signIn, signOut }), [status, user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
