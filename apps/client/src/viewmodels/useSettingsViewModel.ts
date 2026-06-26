import { ThemeMode, useSettingsStore } from "@/store/useSettingsStore";
import { SettingsSchema, SettingsType } from "@/types/settingsTypes";
import { Ok } from "@baza/shared-types";
import { useState } from "react";
import Toast from "react-native-toast-message";

export const useSettingsViewModel = (): SettingsSchema => {
  const settingsStore = useSettingsStore();
  const [testInput, setTestInput] = useState("Test Value");
  const [testToggle, setTestToggle] = useState(false);
  const [hiddenSetting, setHiddenSetting] = useState(true);
  const [hiddenSettingValue, setHiddenSettingValue] = useState("Hidden Value");

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
    {
      title: "Testing",
      settings: [
        {
          id: "testButton",
          label: "Test Button",
          description: "This is a test button.",
          type: SettingsType.BUTTON,
          onClickFn: () => {
            setHiddenSetting(!hiddenSetting);
            Toast.show({
              text1: "Hello",
              text2: "This is a toast message from the Settings screen.",
              type: "info",
              position: "bottom",
              bottomOffset: 80,
            });
            return Ok();
          },
        },
        {
          id: "testInput",
          label: "Test Input",
          description: "This is a test input.",
          type: SettingsType.INPUT,
          value: testInput,
          onChangeFn: (value: string) => {
            setTestInput(value);
            Toast.show({
              text1: "Input Changed",
              text2: `New value: ${value}`,
              type: "success",
              position: "bottom",
              bottomOffset: 80,
            });
            return Ok();
          },
          defaultValue: testInput,
          placeholder: "Enter something...",
        },
        {
          id: "testToggle",
          label: "Test Toggle",
          description: "This is a test toggle.",
          type: SettingsType.TOGGLE,
          value: testToggle,
          onChangeFn: (value: boolean) => {
            setTestToggle(value);
            Toast.show({
              text1: "Toggle Changed",
              text2: `New value: ${value}`,
              type: "success",
              position: "bottom",
              bottomOffset: 80,
            });
            return Ok();
          },
          defaultValue: testToggle,
        },
        {
          id: "hiddenSetting",
          label: "Hidden Setting",
          description:
            "This setting is hidden unless the test button is clicked.",
          type: SettingsType.INPUT,
          value: hiddenSettingValue,
          onChangeFn: (value: string) => {
            setHiddenSettingValue(value);
            Toast.show({
              text1: "Hidden Input Changed",
              text2: `New value: ${value}`,
              type: "success",
              position: "bottom",
              bottomOffset: 80,
            });
            return Ok();
          },
          defaultValue: hiddenSettingValue,
          placeholder: "Enter something...",
          visibilityFn: () => hiddenSetting,
        },
      ],
    },
    {
      title: "Account",
      settings: [
        {
          id: "signOut",
          label: "Sign Out",
          description: "Sign out of your account.",
          type: SettingsType.BUTTON,
          onClickFn: () => {
            console.log("Signing out...");
            return Ok();
          },
        },
      ],
    },
  ];
};
