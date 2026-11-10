import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError, api, type Profile } from "../../src/api/client";
import { Button } from "../../src/components/Button";
import { TextField } from "../../src/components/TextField";
import { useTheme } from "../../src/theme";

export default function Perfil() {
  const t = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const p = await api.profile.get();
      setProfile(p);
      setFullName(p.person.fullName);
      setPhone(p.person.phone ?? "");
    } catch {
      setFetchError("Não foi possível carregar o perfil.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const updated = await api.profile.update({ fullName: fullName.trim(), phone: phone.trim() });
      setProfile(updated);
      setFullName(updated.person.fullName);
      setPhone(updated.person.phone ?? "");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 422 ? "Dados inválidos. Verifique os campos." : "Não foi possível salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (fetchError) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={styles.body}>
          <Text style={{ color: t.danger }}>{fetchError}</Text>
          <Button title="Voltar" variant="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Button title="← Voltar" variant="ghost" onPress={() => router.back()} />
          <Text style={[styles.title, { color: t.text }]}>Meu perfil</Text>
        </View>

        <TextField label="Nome completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" textContentType="name" />
        <TextField label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" textContentType="telephoneNumber" />

        <View style={[styles.readOnly, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={{ color: t.muted, fontSize: 12 }}>E-mail (somente leitura)</Text>
          <Text style={{ color: t.text, fontWeight: "600" }}>{profile?.person.email ?? "—"}</Text>
        </View>

        {profile?.person.cpf && (
          <View style={[styles.readOnly, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={{ color: t.muted, fontSize: 12 }}>CPF (somente leitura)</Text>
            <Text style={{ color: t.text, fontWeight: "600" }}>{profile.person.cpf}</Text>
          </View>
        )}

        {error && (
          <Text accessibilityRole="alert" style={{ color: t.danger, marginBottom: 12 }}>
            {error}
          </Text>
        )}
        {success && (
          <Text accessibilityRole="status" style={{ color: t.primary, marginBottom: 12 }}>
            Perfil salvo com sucesso!
          </Text>
        )}

        <Button title="Salvar" onPress={save} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { padding: 24 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", marginTop: 8 },
  readOnly: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 12 },
});
