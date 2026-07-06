import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeType } from "../theme";

export const useBasicModalStyles = () => {
  const { colors } = useAppTheme();

  return useMemo(() => BasicModalStyles(colors), [colors]);
};

export const BasicModalStyles = (colors: ThemeType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    modalCard: {
      padding: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      width: "80%",
      alignSelf: "center",
      justifyContent: "center",
    },
    subTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.onBackground,
      textAlign: "center",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      width: "100%",
      paddingVertical: 20,
    },
    actionButton: {
      backgroundColor: colors.primary,
      color: colors.onPrimary,
      height: 48,
      width: 90,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    cancelButton: {
      backgroundColor: colors.onPrimary,
      color: colors.primary,
      height: 48,
      width: 90,
      borderRadius: 30,
      borderColor: colors.primary,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      boxShadow: `0px 4px 10px rgba(0, 0, 0, 0.15)`,
    },
    buttonPressed: {
      opacity: 0.7,
    },
  });
