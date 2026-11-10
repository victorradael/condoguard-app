import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";
import { DemoBanner } from "../src/components/DemoBanner";
import { useTheme } from "../src/theme";

function Routes() {
  const { status } = useAuth();
  const t = useTheme();
  if (status === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: t.bg }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === "signedIn"}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status === "signedOut"}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const t = useTheme();
  return (
    <AuthProvider>
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <DemoBanner />
        <Routes />
      </View>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
