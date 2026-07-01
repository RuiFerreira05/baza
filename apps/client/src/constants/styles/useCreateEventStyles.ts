import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useCreateEventStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => CreateEventStyles(colors), [colors]);
};

export const CreateEventStyles = (colors: ThemeType) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      boxShadow: `0px 4px 6px rgba(0, 0, 0, 0.3)`,
    },
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
      flex: 1, // Let title wrap or squeeze if needed, giving button room
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
    formScroll: {
      gap: 16,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.onSurfaceVariant,
    },
    timeRow: {
      flexDirection: "row",
      gap: 16,
    },
    timePickerButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.background,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    timePickerText: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.onSurface,
    },
    repeatLabel: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    repeatRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    repeatCapsule: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    repeatCapsuleActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceVariant,
    },
    repeatText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.onSurfaceVariant,
    },
    repeatTextActive: {
      color: colors.primary,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
    },
    switchLabelContainer: {
      flexDirection: "column",
      gap: 2,
    },
    switchLabel: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
    },
    switchSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.onSurfaceVariant,
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
