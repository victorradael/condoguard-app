import { getApiUrl } from "../config";
import { tokenStore } from "../auth/tokenStore";
import type { components } from "./schema";

export type TokenPair = components["schemas"]["TokenPair"];
export type User = components["schemas"]["User"];
export type Health = components["schemas"]["Health"];

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

let onSessionExpired: () => void = () => {};
/** O AuthProvider registra aqui o que fazer quando o refresh é recusado. */
export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn;
}

async function raw(path: string, init: RequestInit & { token?: string } = {}): Promise<Response> {
  const { token, headers, ...rest } = init;
  return fetch(`${getApiUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `Erro ${res.status}`);
  return body as T;
}

// Single-flight: várias requisições com 401 simultâneas compartilham um só refresh
// (o refresh token é rotativo; reutilizar o antigo o revogaria).
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    const current = await tokenStore.get();
    if (!current) return null;
    try {
      const res = await raw("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      });
      if (res.status === 401) {
        await tokenStore.clear();
        onSessionExpired();
        return null;
      }
      const pair = await parse<TokenPair>(res);
      await tokenStore.set(pair);
      return pair.accessToken;
    } catch {
      return null; // falha de rede: mantém a sessão
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function authed<T>(path: string, init: RequestInit = {}): Promise<T> {
  const tokens = await tokenStore.get();
  let res = await raw(path, { ...init, token: tokens?.accessToken });
  if (res.status === 401 && tokens) {
    const fresh = await refreshAccessToken();
    if (fresh) res = await raw(path, { ...init, token: fresh });
  }
  return parse<T>(res);
}

export const api = {
  health: () => raw("/health").then((r) => parse<Health>(r)),
  async login(username: string, password: string): Promise<TokenPair> {
    const pair = await raw("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }).then((r) => parse<TokenPair>(r));
    await tokenStore.set(pair);
    return pair;
  },
  async logout(): Promise<void> {
    const tokens = await tokenStore.get();
    await tokenStore.clear();
    if (tokens) {
      // Melhor esforço: revoga o refresh no servidor; localmente já saiu.
      await raw("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      }).catch(() => {});
    }
  },
  me: () => authed<User>("/users/me"),
};
