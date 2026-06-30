import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useFriendsStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => FriendsStyles(colors), [colors]);
};

export const FriendsStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      paddingTop: 0,
      gap: 16,
      backgroundColor: colors.background,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      height: "13%",
      width: "100%",
      top: 0,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
  });
