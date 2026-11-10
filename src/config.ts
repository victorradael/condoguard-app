import Constants from "expo-constants";

const DEFAULT_API_URL = "http://10.0.2.2:8080"; // emulador Android -> host

/** URL da API: EXPO_PUBLIC_API_URL (local/túnel) ou extra.apiUrl do app.json. */
export function getApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  return (fromEnv || fromExtra || DEFAULT_API_URL).replace(/\/+$/, "");
}
