import * as SecureStore from "expo-secure-store";
import type { MyUnit } from "../api/client";

const KEY = "cg.activeUnit";

export const unitStore = {
  async get(): Promise<MyUnit | null> {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as MyUnit;
    } catch {
      return null;
    }
  },
  async set(unit: MyUnit): Promise<void> {
    await SecureStore.setItemAsync(KEY, JSON.stringify(unit));
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY);
  },
};
