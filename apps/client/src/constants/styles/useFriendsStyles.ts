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
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    searchBar: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.error,
      textAlign: "center",
    },
    card: {
      flexDirection: "row",
      borderRadius: 12,
      borderWidth: 1,
      marginVertical: 6,
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      boxShadow: `0px 2px 8px rgba(0, 0, 0, 0.15)`,
    },
    cardContent: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 6,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    avatarImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderColor: colors.secondary,
      borderWidth: 1,
    },
    title: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
      flex: 1,
    },
  });
