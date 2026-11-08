import { useColorScheme } from "react-native";

const light = { bg: "#ffffff", surface: "#f2f4f7", text: "#101828", muted: "#667085", primary: "#1d4ed8", onPrimary: "#ffffff", border: "#d0d5dd", danger: "#b42318", warn: "#fef0c7", onWarn: "#7a2e0e" };
const dark: typeof light = { bg: "#0b1220", surface: "#162033", text: "#f2f4f7", muted: "#98a2b3", primary: "#6ea0ff", onPrimary: "#0b1220", border: "#344054", danger: "#f97066", warn: "#7a2e0e", onWarn: "#fef0c7" };

export type Theme = typeof light;
export const themes = { light, dark };

export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}
