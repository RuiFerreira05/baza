import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useEventDetailsStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => EventDetailsStyles(colors), [colors]);
};

export const EventDetailsStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      gap: 16,
      paddingBottom: 32,
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
    card: {
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      padding: 16,
      gap: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 0,
      boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)",
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 8,
    },
    title: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: colors.onSurface,
      flex: 1,
    },
    stageBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    stageIcon: {
      marginRight: 4,
    },
    stageLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
    },
    description: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      lineHeight: 20,
      marginTop: 4,
      color: colors.onSurface,
    },
    divider: {
      height: 1,
      backgroundColor: "transparent",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      marginVertical: 12,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginVertical: 4,
    },
    infoText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.onSurface,
    },
    boldText: {
      fontFamily: "Inter_600SemiBold",
    },
    sectionTitle: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 12,
      color: colors.onSurface,
    },
    planTitle: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
    },
    attendanceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    attendanceStats: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: colors.surfaceVariant,
    },
    attendanceStatsText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.onSurfaceVariant,
    },
    confirmationToggleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
    },
    toggleTextContainer: {
      flex: 1,
    },
    toggleTitle: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
    },
    toggleSub: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
      color: colors.onSurfaceVariant,
    },
    confirmationsList: {
      gap: 10,
    },
    confirmationItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    confirmationUser: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      flex: 1,
      color: colors.onSurface,
    },
    confirmedIcon: {
      marginLeft: "auto",
    },
    emptyAttendance: {
      paddingVertical: 12,
      alignItems: "center",
    },
    emptyAttendanceText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.onSurfaceVariant,
    },
  });
