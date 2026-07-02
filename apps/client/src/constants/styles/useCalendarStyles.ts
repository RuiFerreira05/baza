import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useCalendarStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => CalendarStyles(colors), [colors]);
};

export const CalendarStyles = (colors: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 10,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: colors.onSurface,
    },
    calendarContainer: {
      borderWidth: 1,
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      overflow: "hidden",
      borderColor: colors.border,
      backgroundColor: colors.background,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      marginVertical: 12,
      gap: 12,
    },
    dividerText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.onSurface,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    listContent: {
      paddingBottom: 32,
      flexGrow: 1,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
      paddingHorizontal: 30,
      gap: 8,
    },
    emptyStateTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      marginTop: 8,
      color: colors.onSurface,
    },
    emptyStateSub: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      lineHeight: 18,
      color: colors.onSurfaceVariant,
    },
  });
