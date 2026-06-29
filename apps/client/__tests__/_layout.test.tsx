import RootLayout from "@/app/_layout";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

// Use hoisted function declarations so Jest can access them inside mocked factories at execution time
function MockStack() {
  return <Text>MockStack</Text>;
}
function MockToast() {
  return <Text>MockToast</Text>;
}

jest.mock("expo-router", () => ({
  Stack: MockStack,
}));

jest.mock("@/hooks/useAppTheme", () => ({
  useAppTheme: jest.fn(() => ({
    colors: {},
    appTheme: {},
  })),
}));

jest.mock("@/lib/env", () => ({
  env: {
    EXPO_PUBLIC_SERVER_URL: "http://mock-server.com",
    EXPO_PUBLIC_BYPASS_AUTH: "false",
  },
}));

jest.mock("@/lib/errorReporter", () => ({
  errorReporter: {
    initialize: jest.fn(),
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: any) => <>{children}</>,
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardProvider: ({ children }: any) => <>{children}</>,
  KeyboardController: {
    setInputMode: jest.fn(),
    setDefaultMode: jest.fn(),
  },
  useKeyboardHandler: jest.fn(),
  KeyboardEvents: jest.fn(),
}));

jest.mock("react-native-toast-message", () => MockToast);

// Mock QueryClientProvider so it doesn't try to instantiate real query clients in tests
jest.mock("@tanstack/react-query", () => ({
  QueryClientProvider: ({ children }: any) => <>{children}</>,
  QueryClient: jest.fn().mockImplementation(() => ({})),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the core providers and Stack layout", async () => {
    await render(<RootLayout />);
    expect(screen.getByText("MockStack")).toBeTruthy();
    expect(screen.getByText("MockToast")).toBeTruthy();
  });
});
