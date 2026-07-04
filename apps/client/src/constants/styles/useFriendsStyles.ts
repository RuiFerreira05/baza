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
    iconButton: {
      display: "flex",
      backgroundColor: colors.surface,
      justifyContent: "center",
      height: 40,
      width: 40,
    },
    icon: {
      color: colors.primary,
      marginRight: 0,
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    modalCard: {
      padding: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: "80%",
      alignSelf: "center",
      justifyContent: "center",
    },
    subTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.onBackground,
      textAlign: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      width: "100%",
      paddingVertical: 20,
    },
    text: {
      color: colors.onBackground,
    },
    removeButton: {
      backgroundColor: colors.primary,
      color: colors.onPrimary,
      height: 48,
      width: 90,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    cancelButton: {
      backgroundColor: colors.onPrimary,
      color: colors.primary,
      height: 48,
      width: 90,
      borderRadius: 30,
      borderColor: colors.primary,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    buttonPressed: {
      opacity: 0.7,
    },
  });
