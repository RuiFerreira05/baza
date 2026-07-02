import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useCreateGroupStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => CreateGroupStyles(colors), [colors]);
};

export const CreateGroupStyles = (colors: ThemeType) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      gap: 16,
      maxHeight: "85%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.onSurface,
      flex: 1,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 12,
    },
    inputGroup: {
      gap: 8,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
      paddingBottom: 16,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurfaceVariant,
    },
    submitButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    submitButtonText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.onPrimary,
    },
    disabledButton: {
      opacity: 0.5,
    },
  });
