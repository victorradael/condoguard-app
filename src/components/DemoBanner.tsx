import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { api } from "../api/client";
import { useTheme } from "../theme";

/** Mostra "Ambiente de demonstração" quando /health informa demo=true. */
export function DemoBanner() {
  const t = useTheme();
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    api.health().then((h) => setDemo(!!(h as { status: string; demo?: boolean }).demo)).catch(() => {});
  }, []);
  if (!demo) return null;
  return (
    <Text accessibilityRole="alert" style={[styles.banner, { backgroundColor: t.warn, color: t.onWarn }]}>
      Ambiente de demonstração
    </Text>
  );
}

const styles = StyleSheet.create({
  banner: { textAlign: "center", paddingVertical: 6, fontWeight: "600" },
});
