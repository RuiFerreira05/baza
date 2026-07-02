import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useGroupListStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => GroupListStyles(colors), [colors]);
};

export const GroupListStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 24,
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
    indicator: {
      width: 5,
      height: "100%",
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
    avatarText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    avatarImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    title: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
      flex: 1,
    },
    description: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      lineHeight: 18,
      color: colors.onSurfaceVariant,
    },
    inviteNote: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.primary,
      marginTop: 2,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 10,
    },
    declineButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 80,
    },
    declineButtonText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.error,
    },
    acceptButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 80,
    },
    acceptButtonText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.onPrimary,
    },
    disabledButton: {
      opacity: 0.5,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 80,
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
      textAlign: "center",
    },
    emptyStateSub: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 20,
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
  });
