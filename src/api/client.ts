import { getApiUrl } from "../config";
import { tokenStore } from "../auth/tokenStore";
import type { components } from "./schema";

export type TokenPair = components["schemas"]["TokenPair"];
export type User = components["schemas"]["User"];
export type Health = components["schemas"]["Health"];

// ── Types for new features (FAB-20) ──────────────────────────────────────────

export type Membership = { id: string; name: string; roles: string[] };

export type MyUnit = {
  linkId: string;
  unitId: string;
  unitNumber: string;
  blockName?: string;
  kind: string;
  startsOn: string;
  active: boolean;
  canManageHousehold: boolean;
};

export type Profile = {
  person: {
    id: string;
    fullName: string;
    cpf?: string;
    email?: string;
    phone?: string;
  };
  units: MyUnit[];
};

export type Link = {
  id: string;
  unitId: string;
  personId: string;
  personName?: string;
  kind: string;
  startsOn: string;
  endsOn?: string;
  active: boolean;
};

export type InvitationInfo = {
  condominiumName: string;
  personName: string;
  email: string;
  accountExists: boolean;
};

export type AcceptResult = {
  condominiumId: string;
  email: string;
  verifyEmail: boolean;
};

export type PersonInput = {
  fullName: string;
  cpf?: string;
  email?: string;
  phone?: string;
};

export type AddLinkRequest = {
  person: PersonInput;
  kind: "morador" | "dependente";
  startsOn?: string;
};

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Extra field for 409 on login (multiple condominiums).
export type MultiCondoError = { condominiums: Membership[] };

let onSessionExpired: () => void = () => {};
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
  if (!res.ok) throw new ApiError(res.status, body?.error ?? `Erro ${res.status}`, body);
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
      if (!pair.accessToken || !pair.refreshToken) return null;
      await tokenStore.set({ accessToken: pair.accessToken, refreshToken: pair.refreshToken });
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

  async login(email: string, password: string, condominiumId?: string): Promise<TokenPair> {
    const pair = await raw("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, ...(condominiumId ? { condominiumId } : {}) }),
    }).then((r) => parse<TokenPair>(r));
    if (!pair.accessToken || !pair.refreshToken) throw new ApiError(500, "Resposta inválida do servidor");
    await tokenStore.set({ accessToken: pair.accessToken, refreshToken: pair.refreshToken });
    return pair;
  },

  async logout(): Promise<void> {
    const tokens = await tokenStore.get();
    await tokenStore.clear();
    if (tokens) {
      await raw("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      }).catch(() => {});
    }
  },

  me: () => authed<User>("/users/me"),

  invitations: {
    inspect: (token: string) =>
      raw("/auth/invitations/inspect", {
        method: "POST",
        body: JSON.stringify({ token }),
      }).then((r) => parse<InvitationInfo>(r)),

    accept: (token: string, password: string, username?: string) =>
      raw("/auth/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token, password, ...(username ? { username } : {}) }),
      }).then((r) => parse<AcceptResult>(r)),
  },

  profile: {
    get: () => authed<Profile>("/me/profile"),
    update: (data: { fullName: string; phone: string }) =>
      authed<Profile>("/me/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    units: () => authed<{ items: MyUnit[] }>("/me/units"),
  },

  units: {
    links: (unitId: string) =>
      authed<{ items: Link[] }>(`/units/${encodeURIComponent(unitId)}/links?active=true`),
    addLink: (unitId: string, data: AddLinkRequest) =>
      authed<Link>(`/units/${encodeURIComponent(unitId)}/links`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  links: {
    end: (linkId: string, endsOn?: string) =>
      authed<Link>(`/links/${encodeURIComponent(linkId)}/end`, {
        method: "PUT",
        body: JSON.stringify(endsOn ? { endsOn } : {}),
      }),
    delete: (linkId: string) =>
      authed<void>(`/links/${encodeURIComponent(linkId)}`, { method: "DELETE" }),
  },
};
