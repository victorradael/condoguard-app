import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/theme";

export default function Home() {
  const t = useTheme();
  const { user, signOut } = useAuth();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.body}>
        <Text style={[styles.title, { color: t.text }]}>Olá, {user?.username}</Text>
        <Text style={{ color: t.muted, marginBottom: 24 }}>{user?.email}</Text>
        <Button title="Sair" variant="ghost" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 24 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
});
