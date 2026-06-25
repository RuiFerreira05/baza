import { Theme, ThemeType } from "@/constants/theme";
import { ThemeMode, useSettingsStore } from "@/store/useSettingsStore";
import { useColorScheme } from "react-native";

interface useThemeReturnType {
  themeMode: ThemeMode;
  colors: ThemeType;
}

export function useAppTheme(): useThemeReturnType {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const systemColorScheme = useColorScheme();

  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  return {
    themeMode,
    colors: Theme[isDark ? "dark" : "light"],
  };
}
