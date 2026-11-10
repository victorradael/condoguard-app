import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, type MyUnit } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthContext";
import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/theme";

export default function TrocarUnidade() {
  const t = useTheme();
  const router = useRouter();
  const { activeUnit, setActiveUnit } = useAuth();
  const [units, setUnits] = useState<MyUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.profile.units();
      setUnits(res.items);
    } catch {
      setError("Não foi possível carregar as unidades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Busca inicial: o setState ocorre depois do await, não de forma síncrona.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function select(unit: MyUnit) {
    await setActiveUnit(unit);
    router.back();
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.header}>
        <Button title="← Voltar" variant="ghost" onPress={() => router.back()} />
        <Text style={[styles.title, { color: t.text }]}>Trocar unidade</Text>
      </View>

      {error && (
        <Text accessibilityRole="alert" style={{ color: t.danger, margin: 16 }}>
          {error}
        </Text>
      )}

      {loading && units.length === 0 ? (
        <Text style={{ color: t.muted, margin: 16 }}>Carregando…</Text>
      ) : (
        <FlatList
          data={units}
          keyExtractor={(item) => item.linkId}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={{ color: t.muted }}>Nenhuma unidade disponível.</Text>}
          renderItem={({ item }) => {
            const isActive = activeUnit?.linkId === item.linkId;
            const label = `${item.blockName ? `${item.blockName} — ` : ""}Unidade ${item.unitNumber}`;
            return (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Selecionar ${label}`}
                onPress={() => void select(item)}
                style={[
                  styles.card,
                  {
                    backgroundColor: isActive ? t.primary : t.surface,
                    borderColor: isActive ? t.primary : t.border,
                  },
                ]}
              >
                <Text style={{ color: isActive ? "#fff" : t.text, fontWeight: "600" }}>{label}</Text>
                {isActive && (
                  <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>Ativa</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { padding: 16, paddingBottom: 0 },
  title: { fontSize: 22, fontWeight: "700", marginTop: 8 },
  card: { borderRadius: 10, borderWidth: 1, padding: 16, marginBottom: 8 },
});
