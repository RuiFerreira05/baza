import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useGroupProfileStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => GroupProfileStyles(colors), [colors]);
};

export const GroupProfileStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
    subTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.onBackground,
    },
    subTitle2: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
    },
    profileView: {
      height: 100,
      width: 100,
      borderRadius: 100,
      borderWidth: 5,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceVariant,
    },
    profileImage: {
      height: 95,
      width: 95,
      borderRadius: 100,
      // elevation: 10,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    profileStats: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 12,
      marginBottom: 20,
    },
    column: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    description: {
      width: "90%",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      backgroundColor: colors.primary,
      paddingVertical: 25,
      borderRadius: 8,
      paddingHorizontal: 20,
      gap: 5,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    columnDivider: {
      height: "70%",
      width: 1,
      backgroundColor: colors.primary,
    },
    subTitleOnPrimary: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.secondary,
    },
    textOnPrimary: {
      color: colors.onPrimary,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 20,
      height: 50,
    },
    iconButton: {
      display: "flex",
      backgroundColor: colors.background,
      justifyContent: "center",
      height: 40,
      width: 40,
    },
    icon: {
      color: colors.onBackground,
      marginRight: 0,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    friendContainer: {
      flex: 1,
      alignItems: "center",
      paddingTop: 75,
      gap: 16,
      backgroundColor: colors.background,
    },
    avatarText: {
      color: colors.primary,
      fontSize: 40,
      fontFamily: "Inter_600SemiBold",
    },
    avatarImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
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
  });
