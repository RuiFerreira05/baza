import { useAuthState } from "@/hooks/useAuthState";
import { authClient } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { ThemeMode, useSettingsStore } from "@/store/useSettingsStore";
import { SettingsSchema, SettingsType } from "@/types/settingsTypes";
import { FailableOk } from "@baza/shared-types";
import { router } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";

export const useSettingsViewModel = (): SettingsSchema => {
  const settingsStore = useSettingsStore();
  const [testInput, setTestInput] = useState("Test Value");
  const [testToggle, setTestToggle] = useState(false);
  const [hiddenSetting, setHiddenSetting] = useState(true);
  const [hiddenSettingValue, setHiddenSettingValue] = useState("Hidden Value");
  const { bypassAuth } = useAuthState();
  const authState = useAuthState();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

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
            return FailableOk();
          },
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
            if (bypassAuth) {
              // Simulate authguard activation by navigating to the login page
              router.replace("/auth/login");
            } else {
              authClient
                .signOut()
                .then(() => {
                  queryClient.clear();
                  Toast.show({
                    text1: "Signed Out",
                    text2: "You have been signed out successfully.",
                    type: "success",
                    position: "bottom",
                    bottomOffset: 80,
                  });
                })
                .catch((error) => {
                  Toast.show({
                    text1: "Sign Out Failed",
                    text2: `Error: ${error.message}`,
                    type: "error",
                    position: "bottom",
                    bottomOffset: 80,
                  });
                });
            }
            return FailableOk();
          },
        },
      ],
    },
    {
      title: "Debug",
      visibilityFn: () => __DEV__,
      settings: [
        {
          id: "clearQueryCache",
          label: "Clear Query Cache",
          description: "Clear the query cache.",
          type: SettingsType.BUTTON,
          onClickFn: () => {
            queryClient.clear();
            Toast.show({
              text1: "Query Cache Cleared",
              text2: "The query cache has been cleared successfully.",
              type: "success",
              position: "bottom",
              bottomOffset: 80,
            });
            return FailableOk();
          },
        },
        {
          id: "toggleDebugInfo",
          label: "Toggle Debug Info",
          description: "Show or hide debug information.",
          type: SettingsType.TOGGLE,
          value: showDebugInfo,
          onChangeFn: (value: boolean) => {
            setShowDebugInfo(value);
            return FailableOk();
          },
          defaultValue: showDebugInfo,
        },
        {
          id: "profileInfo",
          label: "Profile Info",
          description: "View the current profile information.",
          type: SettingsType.INFO,
          infoText: JSON.stringify(authState.profile, null, 2),
          visibilityFn: () => showDebugInfo,
        },
        {
          id: "sessionInfo",
          label: "Session Info",
          description: "View the current session information.",
          type: SettingsType.INFO,
          infoText: JSON.stringify(authState.session, null, 2),
          visibilityFn: () => showDebugInfo,
        },
      ],
    },
  ];
};
