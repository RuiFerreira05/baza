import { Theme, ThemeType } from "@/constants/theme";
import { errorReporter } from "@/services/errorReporter";
import { ThemeMode, useSettingsStore } from "@/store/useSettingsStore";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  Theme as AppTheme,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";

interface useThemeReturnType {
  loading: boolean;
  themeMode: ThemeMode;
  colors: ThemeType;
  isDark: boolean;
  appTheme: AppTheme;
}

export function useAppTheme(): useThemeReturnType {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const systemColorScheme = useColorScheme();

  const [fontsLoaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (error) {
    errorReporter.logError(error, { message: "Error loading fonts" });
  }

  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  const colors = Theme[isDark ? "dark" : "light"];

  const appTheme: AppTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.onSurface,
      border: colors.border,
      notification: colors.primary,
    },
    fonts: {
      ...(isDark ? DarkTheme.fonts : DefaultTheme.fonts),
      regular: {
        fontFamily: "Inter_400Regular",
        fontWeight: "normal",
      },
      medium: {
        fontFamily: "Inter_500Medium",
        fontWeight: "500",
      },
      bold: {
        fontFamily: "Inter_700Bold",
        fontWeight: "bold",
      },
      heavy: {
        fontFamily: "Inter_700Bold",
        fontWeight: "700",
      },
    },
  };

  return {
    loading: !fontsLoaded,
    themeMode,
    colors,
    isDark,
    appTheme,
  };
}
