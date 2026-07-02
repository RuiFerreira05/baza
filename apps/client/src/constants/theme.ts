// Tema dado por AI, precisava de cores para testar cenas

const Colors = {
  // Brand color palette (Indigo-based)
  Indigo500: "#6366F1",
  Indigo400: "#818CF8",
  Indigo950: "#1E1B4B",
  Indigo: "#5A43EA",
  IndigoMedium: "#CBC3FD",
  IndigoLight: "#EEEBFC",

  // Secondary color palette (Sky/Cyan-based)
  Sky500: "#0EA5E9",
  Sky400: "#38BDF8",
  Sky800: "#0369A1",
  Lime: "#D3EA43",
  Green: "#70B31A",

  // Tertiary/Success color palette (Emerald-based)
  Emerald500: "#10B981",
  Emerald400: "#34D399",
  Emerald950: "#064E3B",

  // Neutral slate palette
  Slate50: "#F8FAFC",
  Slate100: "#F1F5F9",
  Slate200: "#E2E8F0",
  Slate400: "#94A3B8",
  Slate500: "#64748B",
  Slate700: "#475569",
  Slate800: "#334155",
  Slate900: "#1E293B",
  Slate950: "#121928",

  // Semantic error palette (Red-based)
  Red500: "#EF4444",
  Red400: "#F87171",
  Red950: "#7F1D1D",

  // Utility colors
  White: "#FFFFFF",
} as const;

export type ThemeType = Record<keyof typeof Theme.light, string>;

export const Theme = {
  light: {
    primary: Colors.Indigo,
    onPrimary: Colors.White,
    secondary: Colors.Lime,
    onSecondary: Colors.White,
    tertiary: Colors.Green,
    onTertiary: Colors.White,

    background: Colors.Slate50,
    onBackground: Colors.Slate900,

    border: Colors.Slate200,
    placeholder: Colors.Slate400,
    disabled: Colors.Slate400,

    surface: Colors.White,
    onSurface: Colors.Slate900,
    surfaceVariant: Colors.IndigoLight,
    onSurfaceVariant: Colors.Slate500,

    error: Colors.Red500,
    onError: Colors.White,
    success: Colors.Emerald500,
    onSuccess: Colors.White,
  },
  dark: {
    primary: Colors.IndigoMedium,
    onPrimary: Colors.Indigo950,
    secondary: Colors.Indigo,
    onSecondary: Colors.White,
    tertiary: Colors.Lime,
    onTertiary: Colors.Indigo,

    background: Colors.Slate950,
    onBackground: Colors.Slate100,

    border: Colors.Slate700,
    placeholder: Colors.Slate500,
    disabled: Colors.Slate500,

    surface: Colors.Slate900,
    onSurface: Colors.Slate100,
    surfaceVariant: Colors.Slate800,
    onSurfaceVariant: Colors.Slate400,

    error: Colors.Red400,
    onError: Colors.Red950,
    success: Colors.Emerald400,
    onSuccess: Colors.Emerald950,
  },
} satisfies Record<"light" | "dark", unknown>;
