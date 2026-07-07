import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useGroupEditProfileStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => GroupEditProfileStyles(colors), [colors]);
};

export const GroupEditProfileStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: 16,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      alignItems: "center",
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
      backgroundColor: colors.surfaceVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    profileImage: {
      height: 95,
      width: 95,
      borderRadius: 100,
      elevation: 0,
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    column: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    columnOptions: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    subTitleOnPrimary: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.secondary,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      width: "100%",
      paddingVertical: 20,
    },
    editButton: {
      display: "flex",
      backgroundColor: colors.primary,
      justifyContent: "center",
      height: 40,
      width: 40,
      overflow: "hidden",
    },
    editicon: {
      color: colors.secondary,
      marginRight: 0,
    },
    photoContainer: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0,
    },
    iconContainer: {
      alignSelf: "center",
      left: 35,
      bottom: 30,
      borderRadius: 100,
    },
    form: {
      gap: 30,
      width: "100%",
    },
    inputGroup: {
      backgroundColor: colors.surface,
      padding: 28,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
    },
    inputCard: {
      backgroundColor: colors.surface,
      padding: 28,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: "100%",
      maxWidth: 600,
      alignSelf: "center",
    },
    button: {
      backgroundColor: colors.primary,
      height: 48,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
    },
    buttonDisabled: {
      backgroundColor: colors.disabled,
    },
    buttonPressed: {
      opacity: 0.9,
    },
    buttonText: {
      fontFamily: "Inter_600SemiBold",
      color: colors.onPrimary,
      fontSize: 16,
    },
    modalCard: {
      padding: 28,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: "80%",
      alignSelf: "center",
      justifyContent: "center",
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: colors.primary,
      fontSize: 40,
      fontFamily: "Inter_600SemiBold",
    },
  });
