import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useProfileStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => ProfileStyles(colors), [colors]);
};

export const ProfileStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      paddingTop: 60,
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
    },
    profileImage: {
      height: 95,
      width: 95,
      borderRadius: 100,
      elevation: 10,
    },
    profileStats: {
      width: "90%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingVertical: 12,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.background,
      marginBottom: 50,
    },
    column: {
      flexDirection: "column",
      alignItems: "center",
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
      elevation: 3,
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
  });
