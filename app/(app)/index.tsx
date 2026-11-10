import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/theme";

export default function Home() {
  const t = useTheme();
  const router = useRouter();
  const { user, activeUnit, signOut } = useAuth();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.body}>
        <Text style={[styles.title, { color: t.text }]}>Olá, {user?.username}</Text>
        <Text style={{ color: t.muted, marginBottom: 24 }}>
          {activeUnit
            ? `Unidade ${activeUnit.unitNumber}${activeUnit.blockName ? ` — ${activeUnit.blockName}` : ""}`
            : user?.email}
        </Text>
        <Button title="Meu perfil" onPress={() => router.push("/(app)/perfil")} />
        <View style={{ marginTop: 12 }}>
          <Button title="Moradores" onPress={() => router.push("/(app)/moradores")} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Button title="Trocar unidade" variant="ghost" onPress={() => router.push("/(app)/trocar-unidade")} />
        </View>
        <View style={{ marginTop: 24 }}>
          <Button title="Sair" variant="ghost" onPress={signOut} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 24 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
});
