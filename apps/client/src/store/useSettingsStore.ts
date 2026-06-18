import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { Appearance } from "react-native";
import { Theme } from "@/constants/theme";

const secureStoreAdapter = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) =>
    SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export type ThemeMode = "light" | "dark" | "system";

interface SettingsState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: "baza-settings-storage",
      storage: createJSONStorage(() => secureStoreAdapter),
    },
  ),
);

export function useTheme() {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const systemColorScheme = Appearance.getColorScheme();

  const isDark =
    themeMode === "system"
      ? systemColorScheme === "dark"
      : themeMode === "dark";

  return {
    themeMode,
    isDark,
    theme: Theme[isDark ? "dark" : "light"],
  };
}
