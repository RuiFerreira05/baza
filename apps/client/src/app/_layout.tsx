import { getToastConfig } from "@/components/ToastConfig";
import { useAppTheme } from "@/hooks/useAppTheme";
import { authClient } from "@/lib/auth";
import { env } from "@/lib/env";
import { queryClient } from "@/lib/queryClient";
import { errorReporter } from "@/services/errorReporter";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Initialize global exception and rejection handlers
errorReporter.initialize();

// Export the ErrorBoundary component for Expo Router to catch render crashes
export { AppErrorBoundary as ErrorBoundary } from "@/components/ErrorBoundary";

// Bypasses auth check only in development mode if EXPO_PUBLIC_BYPASS_AUTH is set to "true".
// This ensures that authentication checks are never bypassed in production releases.
const BYPASS_AUTH = __DEV__ && env.EXPO_PUBLIC_BYPASS_AUTH === "true";
console.log(`Bypass auth: ${BYPASS_AUTH}`);

export default function RootLayout() {
  const { colors, appTheme, loading: themeLoading } = useAppTheme();
  const toastConfig = getToastConfig(colors, appTheme);

  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const router = useRouter();

  const isReady = !themeLoading && (BYPASS_AUTH || !isPending);

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
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <ThemeProvider value={appTheme}>
            <Stack screenOptions={{ headerShown: false }} />
            <Toast config={toastConfig} />
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
