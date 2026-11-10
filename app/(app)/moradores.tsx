import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError, api, type Link } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/theme";

const KIND_LABELS: Record<string, string> = {
  proprietario: "Proprietário",
  coproprietario: "Coproprietário",
  inquilino: "Inquilino",
  morador: "Morador",
  dependente: "Dependente",
};

export default function Moradores() {
  const t = useTheme();
  const router = useRouter();
  const { activeUnit } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const canManage = activeUnit?.canManageHousehold ?? false;

  const load = useCallback(async () => {
    if (!activeUnit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.units.links(activeUnit.unitId);
      setLinks(res.items);
    } catch {
      setError("Não foi possível carregar os moradores.");
    } finally {
      setLoading(false);
    }
  }, [activeUnit]);

  useEffect(() => {
    void load();
  }, [load]);

  function confirmRemove(link: Link) {
    if (!canManage) return;
    const isNew = isLinkNewToday(link);
    const title = isNew ? "Remover vínculo" : "Encerrar vínculo";
    const msg = isNew
      ? `Remover ${link.personName ?? "morador"} completamente (vínculo de hoje)?`
      : `Encerrar o vínculo de ${link.personName ?? "morador"} a partir de hoje?`;

    Alert.alert(title, msg, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", style: "destructive", onPress: () => void removeLink(link, isNew) },
    ]);
  }

  function isLinkNewToday(link: Link): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return link.startsOn === today;
  }

  async function removeLink(link: Link, deleteIt: boolean) {
    setRemovingId(link.id);
    try {
      if (deleteIt) {
        await api.links.delete(link.id);
      } else {
        await api.links.end(link.id);
      }
      await load();
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 409
          ? "Não é possível remover: o vínculo já está em uso ou regra de negócio violada."
          : "Não foi possível remover o vínculo.";
      Alert.alert("Erro", msg);
    } finally {
      setRemovingId(null);
    }
  }

  const isHouseholdKind = (kind: string) => kind === "morador" || kind === "dependente";

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.header}>
        <Button title="← Voltar" variant="ghost" onPress={() => router.back()} />
        <Text style={[styles.title, { color: t.text }]}>
          Moradores{activeUnit ? ` — Unidade ${activeUnit.unitNumber}` : ""}
        </Text>
      </View>

      {error && (
        <Text accessibilityRole="alert" style={{ color: t.danger, margin: 16 }}>
          {error}
        </Text>
      )}

      {loading && links.length === 0 ? (
        <Text style={{ color: t.muted, margin: 16 }}>Carregando…</Text>
      ) : (
        <FlatList
          data={links}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={{ color: t.muted }}>Nenhum morador ativo.</Text>}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontWeight: "600" }}>{item.personName ?? "—"}</Text>
                  <Text style={{ color: t.muted, fontSize: 12 }}>{KIND_LABELS[item.kind] ?? item.kind}</Text>
                </View>
                {canManage && isHouseholdKind(item.kind) && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${item.personName ?? "morador"}`}
                    onPress={() => confirmRemove(item)}
                    disabled={removingId === item.id}
                    style={[styles.removeBtn, { borderColor: t.danger }]}
                  >
                    <Text style={{ color: t.danger, fontSize: 12, fontWeight: "600" }}>
                      {removingId === item.id ? "…" : "Remover"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {canManage && (
        <View style={{ padding: 16 }}>
          <Button title="+ Adicionar morador ou dependente" onPress={() => router.push("/(app)/adicionar-morador")} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { padding: 16, paddingBottom: 0 },
  title: { fontSize: 22, fontWeight: "700", marginTop: 8 },
  card: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  removeBtn: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
});
