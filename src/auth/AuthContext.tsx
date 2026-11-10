import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setSessionExpiredHandler, type MyUnit, type User } from "../api/client";
import { tokenStore } from "./tokenStore";
import { unitStore } from "../stores/unitStore";

type AuthState = {
  status: "loading" | "signedOut" | "signedIn";
  user: User | null;
  activeUnit: MyUnit | null;
  setActiveUnit: (unit: MyUnit) => Promise<void>;
  signIn: (email: string, password: string, condominiumId?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState["status"]>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [activeUnit, setActiveUnitState] = useState<MyUnit | null>(null);

  const expire = useCallback(() => {
    setUser(null);
    setActiveUnitState(null);
    setStatus("signedOut");
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(expire);
    (async () => {
      if (!(await tokenStore.get())) return expire();
      try {
        const [u, unit] = await Promise.all([api.me(), unitStore.get()]);
        setUser(u);
        setActiveUnitState(unit);
        setStatus("signedIn");
      } catch {
        if (await tokenStore.get()) setStatus("signedIn");
        else expire();
      }
    })();
  }, [expire]);

  const signIn = useCallback(async (email: string, password: string, condominiumId?: string) => {
    await api.login(email, password, condominiumId);
    const [u, profile] = await Promise.all([api.me(), api.profile.get()]);
    setUser(u);
    // Pick the first active unit as default; user can switch later.
    const firstUnit = profile.units.find((u) => u.active) ?? profile.units[0] ?? null;
    if (firstUnit) {
      await unitStore.set(firstUnit);
      setActiveUnitState(firstUnit);
    }
    setStatus("signedIn");
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([api.logout(), unitStore.clear()]);
    expire();
  }, [expire]);

  const setActiveUnit = useCallback(async (unit: MyUnit) => {
    await unitStore.set(unit);
    setActiveUnitState(unit);
  }, []);

  const value = useMemo(
    () => ({ status, user, activeUnit, setActiveUnit, signIn, signOut }),
    [status, user, activeUnit, setActiveUnit, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
