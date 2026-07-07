import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useAuthStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => AuthStyles(colors), [colors]);
};

export const AuthStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    authCard: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: "100%",
      maxWidth: 400,
      alignSelf: "center",
    },
    header: {
      marginBottom: 24,
      alignItems: "center",
    },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: colors.onSurface,
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.onSurfaceVariant,
      textAlign: "center",
    },
    form: {
      gap: 16,
    },
    inputGroup: {
      gap: 6,
    },
    label: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.onSurface,
    },
    tip: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.error,
    },
    input: {
      fontFamily: "Inter_400Regular",
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.onSurface,
      backgroundColor: colors.surface,
    },
    multiInput: {
      fontFamily: "Inter_400Regular",
      // height: 100,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 15,
      color: colors.onSurface,
      backgroundColor: colors.surface,
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
    linkButton: {
      alignItems: "center",
      marginTop: 16,
      paddingVertical: 8,
    },
    linkText: {
      fontFamily: "Inter_500Medium",
      fontSize: 14,
      color: colors.primary,
    },
    googleButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      height: 48,
      borderRadius: 10,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      gap: 8,
    },
    googleButtonText: {
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
      fontSize: 16,
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginHorizontal: 12,
    },
  });
