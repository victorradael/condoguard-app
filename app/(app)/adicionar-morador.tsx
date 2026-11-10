import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError, api } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { TextField } from "../../src/components/TextField";
import { useTheme } from "../../src/theme";

type Kind = "morador" | "dependente";

export default function AdicionarMorador() {
  const t = useTheme();
  const router = useRouter();
  const { activeUnit } = useAuth();

  const [kind, setKind] = useState<Kind>("morador");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!activeUnit) return;
    if (!fullName.trim()) {
      setError("Informe o nome completo.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.units.addLink(activeUnit.unitId, {
        kind,
        person: {
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          cpf: cpf.trim() || undefined,
        },
      });
      router.back();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) {
          setError("CPF já cadastrado neste condomínio. Fale com o síndico para vincular a pessoa existente.");
        } else if (e.status === 403) {
          setError("Você não tem permissão para adicionar moradores.");
        } else if (e.status === 422) {
          setError("Dados inválidos. Verifique CPF e os campos obrigatórios.");
        } else {
          setError("Não foi possível adicionar. Tente novamente.");
        }
      } else {
        setError("Não foi possível adicionar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Button title="← Voltar" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: t.text }]}>Adicionar morador</Text>
        </View>

        <Text style={{ color: t.muted, marginBottom: 12 }}>Tipo de vínculo</Text>
        <View style={styles.kindRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button title="Morador" variant={kind === "morador" ? "primary" : "ghost"} onPress={() => setKind("morador")} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Dependente" variant={kind === "dependente" ? "primary" : "ghost"} onPress={() => setKind("dependente")} />
          </View>
        </View>

        <TextField label="Nome completo *" value={fullName} onChangeText={setFullName} autoCapitalize="words" textContentType="name" />
        <TextField label="CPF (opcional)" value={cpf} onChangeText={setCpf} keyboardType="numeric" textContentType="none" placeholder="000.000.000-00" />
        <TextField label="E-mail (opcional)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" />
        <TextField label="Telefone (opcional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textContentType="telephoneNumber" />

        {error && (
          <Text accessibilityRole="alert" style={{ color: t.danger, marginBottom: 12 }}>
            {error}
          </Text>
        )}

        <Button title="Adicionar" onPress={submit} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 24 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", marginTop: 8 },
  kindRow: { flexDirection: "row", marginBottom: 16 },
});
