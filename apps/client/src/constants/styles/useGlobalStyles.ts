import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useGlobalStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => GlobalStyles(colors), [colors]);
};

export const GlobalStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 16,
      backgroundColor: colors.background,
    },
    text: {
      color: colors.onBackground,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.onBackground,
    },
  });
