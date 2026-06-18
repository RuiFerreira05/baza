import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { authClient } from "@/lib/auth";
import { env } from "@/lib/env";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Bypasses auth check only in development mode if EXPO_PUBLIC_BYPASS_AUTH is set to "true".
// This ensures that authentication checks are never bypassed in production releases.
const BYPASS_AUTH = __DEV__ && env.EXPO_PUBLIC_BYPASS_AUTH === "true";
console.log(`Bypass auth: ${BYPASS_AUTH}`);

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (BYPASS_AUTH) return;
    if (isPending) return;

    const inProtectedGroup = segments[0] === "(protected)";
    const inAuthGroup = segments[0] === "auth";

    if (!session && inProtectedGroup) {
      router.replace("/auth/login");
    } else if (session && inAuthGroup) {
      router.replace("/(protected)/calendar");
    }
  }, [session, isPending, segments, router]);

  if (isPending && !BYPASS_AUTH) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
