import { useSettingsStore, ThemeMode } from "@/store/useSettingsStore";
import { SettingsSchema, SettingsType } from "@/types/settingsTypes";
import { Ok } from "@baza/shared-types";

export const useSettingsViewModel = (): SettingsSchema => {
  const settingsStore = useSettingsStore();

  return [
    {
      title: "Appearance",
      settings: [
        {
          id: "themeMode",
          label: "Theme Mode",
          description: "Choose between light, dark, or system theme.",
          type: SettingsType.SELECT,
          options: [ThemeMode.LIGHT, ThemeMode.DARK, ThemeMode.SYSTEM],
          value: settingsStore.themeMode,
          onChangeFn: (value: string) => {
            settingsStore.setThemeMode(value as ThemeMode);
            return Ok();
          },
        },
      ],
    },
  ];
};
