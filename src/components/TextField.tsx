import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../theme";

export function TextField({ label, ...props }: { label: string } & TextInputProps) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <Text style={{ color: t.text, marginBottom: 4 }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.muted}
        style={[styles.input, { color: t.text, borderColor: t.border, backgroundColor: t.surface }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
});
