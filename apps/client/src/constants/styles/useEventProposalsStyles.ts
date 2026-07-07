import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useEventProposalsStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => EventProposalsStyles(colors), [colors]);
};

export const EventProposalsStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    errorText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      marginTop: 8,
      textAlign: "center",
      color: colors.error,
    },
    warningBanner: {
      flexDirection: "row",
      padding: 16,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 8,
      borderWidth: 1,
      gap: 12,
      backgroundColor: colors.error + "10",
      borderColor: colors.error,
    },
    bannerTextContainer: {
      flex: 1,
      gap: 2,
    },
    bannerTitle: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
    },
    bannerSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      lineHeight: 16,
    },
    listContent: {
      padding: 16,
      gap: 16,
      paddingBottom: 80, // Space for FAB
    },
    planCard: {
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 0,
      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
    },
    planHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    planTitleContainer: {
      flex: 1,
    },
    planTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
    },
    planProposer: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    boldText: {
      fontFamily: "Inter_600SemiBold",
    },
    badgeRow: {
      alignItems: "flex-end",
      gap: 6,
    },
    tiedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    tiedBadgeText: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      textTransform: "uppercase",
    },
    voteCountBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    voteCountText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
    },
    divider: {
      height: 1,
      backgroundColor: "transparent",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      marginVertical: 12,
    },
    detailsSection: {
      gap: 8,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    detailText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      flex: 1,
    },
    cardActionsRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
      gap: 12,
    },
    voteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 6,
      minWidth: 80,
    },
    voteButtonText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
    },
    resolveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    resolveButtonText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
    },
    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 0,
      boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.25)",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 20,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      marginTop: 8,
    },
    emptySub: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      lineHeight: 18,
    },
    emptyButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 12,
    },
    emptyButtonText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
  });
