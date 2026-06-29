import { getToastConfig } from "@/components/ToastConfig";
import { useAppTheme } from "@/hooks/useAppTheme";
import { errorReporter } from "@/lib/errorReporter";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Initialize global exception and rejection handlers
errorReporter.initialize();

// Export the ErrorBoundary component for Expo Router to catch render crashes
export { AppErrorBoundary as ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout() {
  const { colors, appTheme } = useAppTheme();
  const toastConfig = getToastConfig(colors, appTheme);

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
