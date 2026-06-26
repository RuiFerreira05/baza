import { ThemeType } from "@/constants/theme";
import { Theme } from "@react-navigation/native";
import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const getToastConfig = (colors: ThemeType, appTheme: Theme) => ({
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.success,
      }}
      contentContainerStyle={{ backgroundColor: colors.surface }}
      text1Style={{
        color: colors.onSurface,
        fontSize: 14,
      }}
      text2Style={{
        color: colors.onSurfaceVariant,
        fontSize: 12,
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.error,
      }}
      contentContainerStyle={{ backgroundColor: colors.surface }}
      text1Style={{
        color: colors.onSurface,
        fontSize: 14,
      }}
      text2Style={{
        color: colors.onSurfaceVariant,
        fontSize: 12,
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.primary,
      }}
      contentContainerStyle={{ backgroundColor: colors.surface }}
      text1Style={{
        color: colors.onSurface,
        fontSize: 14,
      }}
      text2Style={{
        color: colors.onSurfaceVariant,
        fontSize: 12,
      }}
    />
  ),
});
