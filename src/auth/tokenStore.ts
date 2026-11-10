import * as SecureStore from "expo-secure-store";

// Único lugar do app que persiste tokens: expo-secure-store (Keychain/Keystore).
// Nunca usar AsyncStorage/MMKV/arquivos para credenciais.
const ACCESS_KEY = "cg.accessToken";
const REFRESH_KEY = "cg.refreshToken";

export type Tokens = { accessToken: string; refreshToken: string };

export const tokenStore = {
  async get(): Promise<Tokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY),
      SecureStore.getItemAsync(REFRESH_KEY),
    ]);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  },
  async set(tokens: Tokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken),
    ]);
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};
