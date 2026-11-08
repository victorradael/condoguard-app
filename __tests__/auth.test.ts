import * as SecureStore from "expo-secure-store";
import { api, setSessionExpiredHandler } from "../src/api/client";
import { tokenStore } from "../src/auth/tokenStore";

const json = (status: number, body?: unknown) =>
  Promise.resolve({ status, ok: status < 400, json: async () => body } as Response);

const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe("login/logout", () => {
  it("guarda tokens apenas no secure-store", async () => {
    fetchMock.mockReturnValueOnce(json(200, { accessToken: "A1", refreshToken: "R1", roles: [] }));
    await api.login("ana", "pw");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("cg.accessToken", "A1");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("cg.refreshToken", "R1");
    expect(await tokenStore.get()).toEqual({ accessToken: "A1", refreshToken: "R1" });
  });

  it("logout limpa o secure-store e revoga o refresh", async () => {
    await tokenStore.set({ accessToken: "A1", refreshToken: "R1" });
    fetchMock.mockReturnValueOnce(json(204));
    await api.logout();
    expect(await tokenStore.get()).toBeNull();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/auth\/logout$/);
    expect(JSON.parse(init.body)).toEqual({ refreshToken: "R1" });
  });
});

describe("renovação automática", () => {
  it("renova no 401 e repete a requisição com o novo access token", async () => {
    await tokenStore.set({ accessToken: "old", refreshToken: "R1" });
    fetchMock
      .mockReturnValueOnce(json(401, { error: "expired" }))
      .mockReturnValueOnce(json(200, { accessToken: "new", refreshToken: "R2", roles: [] }))
      .mockReturnValueOnce(json(200, { id: "1", username: "ana", email: "a@b.c", roles: [] }));
    const me = await api.me();
    expect(me.username).toBe("ana");
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe("Bearer new");
    expect(await tokenStore.get()).toEqual({ accessToken: "new", refreshToken: "R2" });
  });

  it("401 simultâneos compartilham um único refresh", async () => {
    await tokenStore.set({ accessToken: "old", refreshToken: "R1" });
    fetchMock.mockImplementation((url: string, init: RequestInit & { headers: Record<string, string> }) => {
      if (url.endsWith("/auth/refresh")) return json(200, { accessToken: "new", refreshToken: "R2", roles: [] });
      return init.headers.Authorization === "Bearer new" ? json(200, { id: "1", username: "a", email: "a@b.c", roles: [] }) : json(401, { error: "x" });
    });
    await Promise.all([api.me(), api.me()]);
    expect(fetchMock.mock.calls.filter(([u]) => String(u).endsWith("/auth/refresh"))).toHaveLength(1);
  });

  it("desloga quando o refresh é revogado", async () => {
    await tokenStore.set({ accessToken: "old", refreshToken: "R1" });
    const expired = jest.fn();
    setSessionExpiredHandler(expired);
    fetchMock.mockReturnValueOnce(json(401, { error: "x" })).mockReturnValueOnce(json(401, { error: "revoked" }));
    await expect(api.me()).rejects.toMatchObject({ status: 401 });
    expect(expired).toHaveBeenCalled();
    expect(await tokenStore.get()).toBeNull();
  });
});

describe("segurança", () => {
  it("tokens não aparecem em logs", async () => {
    const spies = (["log", "info", "warn", "error", "debug"] as const).map((m) => jest.spyOn(console, m).mockImplementation());
    fetchMock.mockReturnValueOnce(json(200, { accessToken: "SECRET-A", refreshToken: "SECRET-R", roles: [] }));
    await api.login("ana", "pw");
    await api.logout().catch(() => {});
    const logged = JSON.stringify(spies.flatMap((s) => s.mock.calls));
    expect(logged).not.toMatch(/SECRET/);
    spies.forEach((s) => s.mockRestore());
  });

  it("o app não depende de AsyncStorage", () => {
    const pkg = require("../package.json");
    expect(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).join()).not.toMatch(/async-storage/);
  });
});
