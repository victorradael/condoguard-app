import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { TextField } from "../../src/components/TextField";
import { useTheme } from "../../src/theme";

export default function Login() {
  const t = useTheme();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? "Usuário ou senha inválidos." : "Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: t.text }]}>Condoguard</Text>
        <TextField label="Usuário" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} textContentType="username" />
        <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" textContentType="password" />
        {error && <Text accessibilityRole="alert" style={{ color: t.danger, marginBottom: 12 }}>{error}</Text>}
        <Button title="Entrar" onPress={submit} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center" },
  form: { padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
});
