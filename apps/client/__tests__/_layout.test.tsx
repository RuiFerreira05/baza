import RootLayout from "@/app/_layout";
import { authClient } from "@/lib/auth";
import { useFonts } from "@expo-google-fonts/inter";
import { act, render, screen, waitFor } from "@testing-library/react-native";
import { useSegments } from "expo-router";
import React from "react";
import { Text } from "react-native";

// Mock router replace mock function
const mockReplace = jest.fn();

// Use hoisted function declarations so Jest can access them inside mocked factories at execution time
function MockStack() {
  return <Text>MockStack</Text>;
}
function MockToast() {
  return <Text>MockToast</Text>;
}

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSegments: jest.fn(),
  Stack: MockStack,
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    useSession: jest.fn(),
  },
}));

jest.mock("@expo-google-fonts/inter", () => ({
  useFonts: jest.fn(),
  Inter_400Regular: "Inter_400Regular",
  Inter_500Medium: "Inter_500Medium",
  Inter_600SemiBold: "Inter_600SemiBold",
  Inter_700Bold: "Inter_700Bold",
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

describe("RootLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render null if fonts are not loaded yet", async () => {
    (useFonts as jest.Mock).mockReturnValue([false]);
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: true,
    });
    (useSegments as jest.Mock).mockReturnValue([]);

    const { toJSON } = await render(<RootLayout />);
    expect(toJSON()).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should render null if fonts are loaded but session is pending (and bypass auth is false)", async () => {
    (useFonts as jest.Mock).mockReturnValue([true]);
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: true,
    });
    (useSegments as jest.Mock).mockReturnValue([]);

    const { toJSON } = await render(<RootLayout />);
    expect(toJSON()).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should redirect unauthenticated users in (protected) segment to /auth/login", async () => {
    (useFonts as jest.Mock).mockReturnValue([true]);
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    await render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("should redirect authenticated users in auth segment to /(protected)/calendar", async () => {
    (useFonts as jest.Mock).mockReturnValue([true]);
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "token" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["auth", "login"]);

    await render(<RootLayout />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/(protected)/calendar");
    });
  });

  it("should render the query provider and Stack layout when fonts and session resolve", async () => {
    (useFonts as jest.Mock).mockReturnValue([true]);
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "token" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    await render(<RootLayout />);

    await waitFor(() => {
      expect(screen.getByText("MockStack")).toBeTruthy();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should bypass auth if bypassAuth is true in the account store", async () => {
    const { useAccountStore } = require("@/store/useAccountStore");
    await act(async () => {
      useAccountStore.setState({ bypassAuth: true });
    });

    (useFonts as jest.Mock).mockReturnValue([true]);
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: true,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    try {
      await render(<RootLayout />);
      await waitFor(() => {
        expect(screen.getByText("MockStack")).toBeTruthy();
      });
      expect(mockReplace).not.toHaveBeenCalled();
    } finally {
      await act(async () => {
        useAccountStore.setState({ bypassAuth: false });
      });
    }
  });
});
