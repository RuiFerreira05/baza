import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useSettingsStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => SettingsStyles(colors), [colors]);
};

export const SettingsStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
      textTransform: "uppercase",
      marginTop: 24,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    columnRow: {
      flexDirection: "column",
      gap: 12,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    textContainer: {
      flex: 1,
      paddingRight: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.onSurface,
    },
    description: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    separator: {
      height: 8,
    },
    capsuleContainer: {
      flexDirection: "row",
      gap: 8,
    },
    capsule: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    capsuleActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    capsuleText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.onSurfaceVariant,
    },
    capsuleTextActive: {
      color: colors.onPrimary,
    },
    textInput: {
      height: 40,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      fontSize: 15,
      color: colors.onSurface,
      backgroundColor: colors.surfaceVariant,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: "600",
    },
    infoText: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      alignContent: "center",
    },
    infoContainer: {
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoContentContainer: {
      paddingEnd: 24,
    },
  });
