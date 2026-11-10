import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError, type Membership } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { TextField } from "../../src/components/TextField";
import { useTheme } from "../../src/theme";

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const { signIn } = useAuth();
  const { email: emailParam, condominiumId: condoParam } = useLocalSearchParams<{ email?: string; condominiumId?: string }>();

  const [email, setEmail] = useState(emailParam ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [condominiums, setCondominiums] = useState<Membership[]>([]);
  const [selectedCondoId, setSelectedCondoId] = useState(condoParam ?? "");

  async function submit(condominiumId?: string) {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password, condominiumId || selectedCondoId || undefined);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setError("E-mail ou senha inválidos.");
        } else if (e.status === 403) {
          setError("Confirme seu e-mail antes de fazer login.");
        } else if (e.status === 409) {
          const extra = e.extra as { condominiums?: Membership[] } | null;
          if (extra?.condominiums?.length) {
            setCondominiums(extra.condominiums);
          } else {
            setError("Selecione o condomínio para continuar.");
          }
        } else {
          setError("Não foi possível entrar. Tente novamente.");
        }
      } else {
        setError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (condominiums.length > 0) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={styles.form}>
          <Text style={[styles.title, { color: t.text }]}>Escolha o condomínio</Text>
          <Text style={{ color: t.muted, marginBottom: 16 }}>Sua conta está vinculada a mais de um condomínio.</Text>
          {condominiums.map((c) => (
            <View key={c.id} style={{ marginBottom: 8 }}>
              <Button title={c.name} variant={selectedCondoId === c.id ? "primary" : "ghost"} onPress={() => setSelectedCondoId(c.id)} />
            </View>
          ))}
          {error && (
            <Text accessibilityRole="alert" style={{ color: t.danger, marginBottom: 12 }}>
              {error}
            </Text>
          )}
          <View style={{ marginTop: 8 }}>
            <Button title="Entrar" onPress={() => submit(selectedCondoId)} loading={loading} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.form}>
        <Text style={[styles.title, { color: t.text }]}>Condoguard</Text>
        <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
        <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" textContentType="password" />
        {error && (
          <Text accessibilityRole="alert" style={{ color: t.danger, marginBottom: 12 }}>
            {error}
          </Text>
        )}
        <Button title="Entrar" onPress={() => submit()} loading={loading} />
        <View style={{ marginTop: 16 }}>
          <Button
            title="Tenho um convite"
            variant="ghost"
            onPress={() => router.push("/(public)/convite")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center" },
  form: { padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 24 },
});
