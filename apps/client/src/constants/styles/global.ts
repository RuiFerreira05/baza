import { useTheme } from "@/store/useSettingsStore";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "./theme";

export const useGlobalStyles = () => {
  const { colors } = useTheme();

  return useMemo(() => GlobalStyles(colors), [colors]);
};

export const GlobalStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
    },
  });
