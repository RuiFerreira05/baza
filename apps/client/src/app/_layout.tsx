import { authClient } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Bypasses auth check only in development mode if EXPO_PUBLIC_BYPASS_AUTH is set to "true".
// This ensures that authentication checks are never bypassed in production releases.
const BYPASS_AUTH = __DEV__ && env.EXPO_PUBLIC_BYPASS_AUTH === "true";
console.log(`Bypass auth: ${BYPASS_AUTH}`);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { data: session, isPending } = authClient.useSession();

  const segments = useSegments();
  const router = useRouter();

  const isReady = fontsLoaded && (BYPASS_AUTH || !isPending);

  useEffect(() => {
    if (!isReady) return;
    if (BYPASS_AUTH) return;

    const inProtectedGroup = segments[0] === "(protected)";
    const inAuthGroup = segments[0] === "auth";

    if (!session && inProtectedGroup) {
      router.replace("/auth/login");
    } else if (session && inAuthGroup) {
      router.replace("/(protected)/calendar");
    }
  }, [session, isReady, segments, router]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </SafeAreaProvider>
  );
}
