import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../theme";

type Props = { title: string; onPress: () => void; loading?: boolean; variant?: "primary" | "ghost" };

export function Button({ title, onPress, loading, variant = "primary" }: Props) {
  const t = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={[styles.btn, { backgroundColor: primary ? t.primary : "transparent", borderColor: t.primary }]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? t.onPrimary : t.primary} />
      ) : (
        <Text style={{ color: primary ? t.onPrimary : t.primary, fontWeight: "600" }}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 48, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
});
