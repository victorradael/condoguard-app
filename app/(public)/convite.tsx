import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError, api, type InvitationInfo } from "../../src/api/client";
import { Button } from "../../src/components/Button";
import { TextField } from "../../src/components/TextField";
import { useTheme } from "../../src/theme";

type Step = "token" | "inspect" | "accept" | "done";

export default function Convite() {
  const t = useTheme();
  const router = useRouter();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();

  const [step, setStep] = useState<Step>(tokenParam ? "inspect" : "token");
  const [token, setToken] = useState(tokenParam ?? "");
  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenParam) void inspect(tokenParam);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function inspect(t: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await api.invitations.inspect(t.trim());
      setInfo(res);
      setStep("inspect");
    } catch (e) {
      setError(e instanceof ApiError && e.status === 400 ? "Convite inválido, já usado ou expirado." : "Não foi possível verificar o convite. Tente novamente.");
      setStep("token");
    } finally {
      setLoading(false);
    }
  }

  async function accept() {
    if (!info) return;
    if (!info.accountExists && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!password) {
      setError("Informe a senha.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await api.invitations.accept(token.trim(), password, info.accountExists ? undefined : username || undefined);
      if (result.verifyEmail) {
        setStep("done");
      } else {
        // Redirect to login with prefilled condominium context.
        router.replace({ pathname: "/(public)/login", params: { email: info.email, condominiumId: result.condominiumId } });
      }
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) setError("Senha incorreta para a conta existente.");
        else if (e.status === 422) setError("Senha muito fraca ou dados inválidos.");
        else setError("Não foi possível ativar o convite. Tente novamente.");
      } else {
        setError("Não foi possível ativar o convite. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={styles.body}>
          <Text style={[styles.title, { color: t.text }]}>Verifique seu e-mail</Text>
          <Text style={{ color: t.muted, marginBottom: 24 }}>
            Um link de confirmação foi enviado para {info?.email}. Acesse-o antes de fazer login.
          </Text>
          <Button title="Ir para o login" onPress={() => router.replace("/(public)/login")} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === "token") {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={styles.body}>
          <Text style={[styles.title, { color: t.text }]}>Aceitar convite</Text>
          <Text style={{ color: t.muted, marginBottom: 16 }}>Digite o código recebido (8 grupos de 4 caracteres).</Text>
          <TextField
            label="Código do convite"
            value={token}
            onChangeText={setToken}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="XXXX-XXXX-XXXX-XXXX"
          />
          {error && (
            <Text accessibilityRole="alert" style={{ color: t.danger, marginBottom: 12 }}>
              {error}
            </Text>
          )}
          <Button title="Verificar" onPress={() => inspect(token)} loading={loading} />
          <View style={{ marginTop: 12 }}>
            <Button title="Já tenho conta — Entrar" variant="ghost" onPress={() => router.replace("/(public)/login")} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // step === "inspect" (show info) or "accept" (show form)
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.title, { color: t.text }]}>Bem-vindo(a)!</Text>
        {info && (
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={{ color: t.muted, fontSize: 12 }}>Condomínio</Text>
            <Text style={[styles.cardValue, { color: t.text }]}>{info.condominiumName}</Text>
            <Text style={{ color: t.muted, fontSize: 12, marginTop: 8 }}>Seu nome</Text>
            <Text style={[styles.cardValue, { color: t.text }]}>{info.personName}</Text>
            <Text style={{ color: t.muted, fontSize: 12, marginTop: 8 }}>E-mail</Text>
            <Text style={[styles.cardValue, { color: t.text }]}>{info.email}</Text>
          </View>
        )}

        {info?.accountExists ? (
          <>
            <Text style={{ color: t.muted, marginBottom: 12 }}>Esta conta já existe. Informe a sua senha para confirmar.</Text>
            <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" textContentType="password" />
          </>
        ) : (
          <>
            <Text style={{ color: t.muted, marginBottom: 12 }}>Crie sua senha para ativar o acesso.</Text>
            <TextField label="Nome de usuário (opcional)" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} textContentType="username" />
            <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" textContentType="newPassword" />
            <TextField label="Confirmar senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" textContentType="newPassword" />
          </>
        )}

        {error && (
          <Text accessibilityRole="alert" style={{ color: t.danger, marginBottom: 12 }}>
            {error}
          </Text>
        )}
        <Button title="Ativar convite" onPress={accept} loading={loading} />
        <View style={{ marginTop: 12 }}>
          <Button title="Voltar" variant="ghost" onPress={() => setStep("token")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  card: { borderRadius: 10, borderWidth: 1, padding: 16, marginBottom: 20 },
  cardValue: { fontWeight: "600", fontSize: 16 },
});
