import { Theme, ThemeType } from "@/constants/theme";
import * as SecureStore from "expo-secure-store";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const secureStoreAdapter = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) =>
    SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

interface SettingsState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: ThemeMode.SYSTEM,
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "baza-settings-storage",
      storage: createJSONStorage(() => secureStoreAdapter),
    },
  ),
);

interface useThemeReturnType {
  themeMode: ThemeMode;
  colors: ThemeType;
}

export function useTheme(): useThemeReturnType {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const systemColorScheme = Appearance.getColorScheme();

  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  return {
    themeMode,
    colors: Theme[isDark ? "dark" : "light"],
  };
}
