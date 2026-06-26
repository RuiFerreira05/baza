import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { secureStoreAdapter } from "./secureStoreAdapter";

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
