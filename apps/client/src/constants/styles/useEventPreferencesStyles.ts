import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useEventPreferencesStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => EventPreferencesStyles(colors), [colors]);
};

export const EventPreferencesStyles = (colors: ThemeType) =>
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
    subModeToggleRow: {
      flexDirection: "row",
      padding: 12,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceVariant,
    },
    toggleBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
    },
    scrollContent: {
      padding: 16,
      gap: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
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
    formGroup: {
      gap: 8,
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
    },
    textInput: {
      height: 42,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      borderColor: colors.border,
      color: colors.onSurface,
    },
    textArea: {
      minHeight: 80,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      textAlignVertical: "top",
      borderColor: colors.border,
      color: colors.onSurface,
    },
    tagInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      width: "100%",
    },
    addTagBtn: {
      width: 42,
      height: 42,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    tagsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 4,
    },
    tag: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 16,
      gap: 6,
    },
    tagText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
    },
    multiSelectRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    capsule: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: colors.surfaceVariant,
      borderColor: colors.border,
    },
    capsuleText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
    },
    capitalize: {
      textTransform: "capitalize",
    },
    datesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    dateCapsule: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: colors.surfaceVariant,
      borderColor: colors.border,
    },
    dateCapsuleText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
    },
    budgetRow: {
      flexDirection: "row",
      gap: 16,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 4,
    },
    switchLabelContainer: {
      flex: 1,
      gap: 2,
    },
    switchLabel: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    switchSub: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
    },
    submitBtn: {
      height: 46,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    submitBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
    /* Aggregated View Styles */
    groupDashboard: {
      gap: 16,
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      gap: 12,
    },
    summaryTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    chartContainer: {
      gap: 10,
    },
    chartRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    chartRowLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      width: 90,
    },
    chartBarWrapper: {
      flex: 1,
      height: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 6,
      overflow: "hidden",
    },
    chartBar: {
      height: "100%",
      borderRadius: 6,
    },
    chartRowValue: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      width: 50,
      textAlign: "right",
    },
    budgetOverlapContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
    },
    budgetOverlapText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
    boldText: {
      fontFamily: "Inter_600SemiBold",
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    breakdownItem: {
      alignItems: "center",
      flex: 1,
    },
    breakdownValue: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
    },
    breakdownLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      marginTop: 4,
    },
    dislikesList: {
      gap: 8,
    },
    dislikeItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    dislikeText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      fontStyle: "italic",
      flex: 1,
    },
    emptyText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      paddingVertical: 8,
    },
  });
