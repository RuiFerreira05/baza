import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useEditProfileStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => EditProfileStyles(colors), [colors]);
};

export const EditProfileStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 100,
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
      alignItems: "center",
      justifyContent: "center",
    },
    profileImage: {
      height: 95,
      width: 95,
      borderRadius: 100,
      elevation: 10,
    },
    column: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    subTitleOnPrimary: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.secondary,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      backgroundColor: colors.secondary,
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
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 28,
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
