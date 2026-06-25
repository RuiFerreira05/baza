import { SettingsSchema, SettingsType } from "@/types/settingsTypes";
import { Ok } from "@baza/shared-types";

export const ThemeMode = {
  LIGHT: { label: "Light", value: "light" },
  DARK: { label: "Dark", value: "dark" },
  SYSTEM: { label: "System", value: "system" },
} as const;

export const Settings: SettingsSchema = [
  {
    title: "Appearance",
    settings: [
      {
        id: "themeMode",
        label: "Theme Mode",
        description: "Choose between light, dark, or system theme.",
        type: SettingsType.SELECT,
        options: [ThemeMode.LIGHT, ThemeMode.DARK, ThemeMode.SYSTEM],
        value: ThemeMode.SYSTEM,
        onChangeFn: (value) => {
          // Implement the logic to change the theme mode here
          return Ok();
        },
      },
    ],
  },
] as const;
