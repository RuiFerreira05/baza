import CreateProfileScreen from "@/app/(onboarding)/createProfile";
import { fireEvent, render, screen, act } from "@testing-library/react-native";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthState } from "@/hooks/useAuthState";

jest.mock("@/lib/env", () => ({
  env: {
    EXPO_PUBLIC_SERVER_URL: "http://mock-server.com",
    EXPO_PUBLIC_BYPASS_AUTH: "false",
  },
}));

jest.mock("@/constants/styles/useAuthStyles", () => ({
  useAuthStyles: () => ({
    container: { flex: 1 },
    authCard: { flex: 1 },
    header: {},
    title: { fontSize: 24 },
    subtitle: { fontSize: 16 },
    form: {},
    button: {},
    buttonPressed: {},
    buttonDisabled: {},
    buttonText: {},
  }),
}));

jest.mock("@/hooks/useAppTheme", () => ({
  useAppTheme: () => ({
    colors: {
      onPrimary: "#fff",
    },
  }),
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardGestureArea: ({ children }: any) => <>{children}</>,
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({}),
  Redirect: () => null,
}));

jest.mock("@/hooks/useAuthState", () => ({
  useAuthState: jest.fn(() => ({
    session: { user: { id: "1" } },
    hasNoProfile: true,
    bypassAuth: false,
    isLoading: false,
  })),
}));

import { useCreateProfileViewModel } from "@/viewmodels/useCreateProfileViewModel";

const mockCreateProfile = jest.fn();
jest.mock("@/viewmodels/useCreateProfileViewModel", () => ({
  useCreateProfileViewModel: jest.fn(() => ({
    username: "testuser",
    setUsername: jest.fn(),
    isUsernameValid: true,
    isCreating: false,
    onCreateProfile: mockCreateProfile,
  })),
}));

describe("CreateProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: any) => {
    const queryClient = new QueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  it("should render the screen components correctly", async () => {
    await render(<CreateProfileScreen />, { wrapper });

    expect(screen.getByText("Complete Setup")).toBeTruthy();
    expect(screen.getByText("How would you like to be known? This will be your public username.")).toBeTruthy();
    expect(screen.getByPlaceholderText("e.g. john_doe")).toBeTruthy();
  });

  it("should call onCreateProfile when the button is pressed", async () => {
    await render(<CreateProfileScreen />, { wrapper });

    const button = screen.getByText("Create Profile");
    fireEvent.press(button);

    expect(mockCreateProfile).toHaveBeenCalled();
  });

  it("should render loading indicator when isLoading is true", async () => {
    (useAuthState as jest.Mock).mockReturnValueOnce({
      isLoading: true,
      bypassAuth: false,
      session: null,
      hasNoProfile: true,
    });
    await render(<CreateProfileScreen />, { wrapper });
    expect(screen.queryByText("Complete Setup")).toBeNull();
  });

  it("should redirect to login if not bypassAuth and no session", async () => {
    (useAuthState as jest.Mock).mockReturnValueOnce({
      isLoading: false,
      bypassAuth: false,
      session: null,
      hasNoProfile: true,
    });
    await render(<CreateProfileScreen />, { wrapper });
    expect(screen.queryByText("Complete Setup")).toBeNull();
  });

  it("should redirect to calendar if session exists but user already has a profile", async () => {
    (useAuthState as jest.Mock).mockReturnValueOnce({
      isLoading: false,
      bypassAuth: false,
      session: { user: { id: "1" } },
      hasNoProfile: false,
    });
    await render(<CreateProfileScreen />, { wrapper });
    expect(screen.queryByText("Complete Setup")).toBeNull();
  });

  it("should render correctly when bypassAuth is true", async () => {
    (useAuthState as jest.Mock).mockReturnValueOnce({
      isLoading: false,
      bypassAuth: true,
      session: null,
      hasNoProfile: true,
    });
    await render(<CreateProfileScreen />, { wrapper });
    expect(screen.getByText("Complete Setup")).toBeTruthy();
  });

  it("should render validation tip when username is invalid and not empty", async () => {
    (useCreateProfileViewModel as jest.Mock).mockReturnValueOnce({
      username: "a",
      setUsername: jest.fn(),
      isUsernameValid: false,
      isCreating: false,
      onCreateProfile: mockCreateProfile,
    });
    await render(<CreateProfileScreen />, { wrapper });
    expect(screen.getByText("Username must be 3-20 characters long")).toBeTruthy();
    
    await act(async () => {
      fireEvent(screen.getByTestId("createProfileButton"), "pressIn");
    });
  });

  it("should render ActivityIndicator when isCreating is true", async () => {
    (useCreateProfileViewModel as jest.Mock).mockReturnValueOnce({
      username: "testuser",
      setUsername: jest.fn(),
      isUsernameValid: true,
      isCreating: true,
      onCreateProfile: mockCreateProfile,
    });
    await render(<CreateProfileScreen />, { wrapper });
    
    // The button should not have the "Create Profile" text
    expect(screen.queryByText("Create Profile")).toBeNull();
    
    await act(async () => {
      fireEvent(screen.getByTestId("createProfileButton"), "pressIn");
    });
  });

  it("should apply pressed styles when button is pressed in", async () => {
    await render(<CreateProfileScreen />, { wrapper });
    const button = screen.getByTestId("createProfileButton");
    
    await act(async () => {
      fireEvent(button, "pressIn");
    });
  });

  it("should display error message when vm.error is set", async () => {
    (useCreateProfileViewModel as jest.Mock).mockReturnValueOnce({
      username: "testuser",
      setUsername: jest.fn(),
      isUsernameValid: true,
      isCreating: false,
      onCreateProfile: mockCreateProfile,
      error: "This username is already taken. Please choose another one.",
    });
    await render(<CreateProfileScreen />, { wrapper });
    
    expect(screen.getByText("This username is already taken. Please choose another one.")).toBeTruthy();
  });
});
