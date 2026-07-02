import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useCreateGroupScreenStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => CreateGroupScreenStyles(colors), [colors]);
};

export const CreateGroupScreenStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      padding: 24,
      gap: 20,
    },
    photoSection: {
      alignItems: "center",
      marginVertical: 16,
    },
    circlePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.primary,
    },
    initialsText: {
      fontSize: 40,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    formGroup: {
      gap: 16,
    },
    friendsSection: {
      marginTop: 8,
      gap: 12,
    },
    friendsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    friendsLabel: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.onBackground,
    },
    addFriendButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
    },
    friendsContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 16,
      minHeight: 120,
    },
    friendRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    friendInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    friendAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
    },
    friendAvatarText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    friendUsernameText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: colors.onSurface,
    },
    removeFriendButton: {
      padding: 6,
    },
    emptyFriendsContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 24,
      gap: 8,
    },
    emptyFriendsText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.placeholder,
      textAlign: "center",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 24,
      paddingBottom: 24,
    },
    createButton: {
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 140,
    },
    createButtonText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.onPrimary,
    },
    createButtonDisabled: {
      opacity: 0.5,
    },
    errorText: {
      color: colors.error,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      marginTop: 4,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      maxHeight: "80%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 12,
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.onSurface,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalList: {
      paddingBottom: 12,
    },
    friendSelectRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectionBox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    selectionBoxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    modalFooter: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
      marginTop: 12,
    },
    modalCancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    modalCancelButtonText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurfaceVariant,
    },
    modalAddButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    modalAddButtonText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.onPrimary,
    },
    modalLoaderContainer: {
      paddingVertical: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    modalEmptyContainer: {
      paddingVertical: 32,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    modalEmptyText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.placeholder,
      textAlign: "center",
    },
  });
