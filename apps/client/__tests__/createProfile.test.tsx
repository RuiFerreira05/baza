import CreateProfileScreen from "@/app/(onboarding)/createProfile";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("@/lib/env", () => ({
  env: {
    EXPO_PUBLIC_SERVER_URL: "http://mock-server.com",
    EXPO_PUBLIC_BYPASS_AUTH: "false",
  },
}));

jest.mock("@/constants/styles/useGlobalStyles", () => ({
  useGlobalStyles: () => ({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    text: { color: "black" },
    title: { fontSize: 24, fontWeight: "bold" },
  }),
}));

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe("CreateProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the placeholder screen components correctly", async () => {
    const { getByText } = await render(<CreateProfileScreen />);

    expect(getByText("Create Profile (Placeholder)")).toBeTruthy();
    expect(getByText("Pick a username to get started.")).toBeTruthy();
    expect(getByText("Complete Profile (Mock)")).toBeTruthy();
  });

  it("should redirect to protected calendar route when complete profile is pressed", async () => {
    const { getByText } = await render(<CreateProfileScreen />);

    const button = getByText("Complete Profile (Mock)");
    fireEvent.press(button);

    expect(mockReplace).toHaveBeenCalledWith("/(protected)/calendar");
  });
});
