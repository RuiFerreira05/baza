const Colors = {
  ExampleColor: "#FF0000",
} as const;

export type ThemeType = Record<keyof typeof Theme.light, string>;

export const Theme = {
  light: {
    primary: Colors.ExampleColor,
    onPrimary: "",
    secondary: "",
    onSecondary: "",
    tertiary: "",
    onTertiary: "",

    background: "",
    onBackground: "",

    border: "",
    placeholder: "",

    surface: "",
    onSurface: "",
    surfaceVariant: "",
    onSurfaceVariant: "",

    error: "",
    onError: "",
    success: "",
    onSuccess: "",
  },
  dark: {
    primary: "",
    onPrimary: "",
    secondary: "",
    onSecondary: "",
    tertiary: "",
    onTertiary: "",

    background: "",
    onBackground: "",

    border: "",
    placeholder: "",

    surface: "",
    onSurface: "",
    surfaceVariant: "",
    onSurfaceVariant: "",

    error: "",
    onError: "",
    success: "",
    onSuccess: "",
  },
} satisfies Record<"light" | "dark", unknown>;
