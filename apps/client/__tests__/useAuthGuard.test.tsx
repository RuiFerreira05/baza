import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAppQuery } from "@/hooks/useAppQuery";
import { authClient } from "@/lib/auth";
import { userService } from "@/services/userService";
import { useAccountStore } from "@/store/useAccountStore";
import { createStatusError, Err, ErrorTypes, Ok } from "@baza/shared-types";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useSegments } from "expo-router";
import React from "react";
import { createWrapper } from "./helpers/wrapper";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSegments: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authClient: {
    useSession: jest.fn(),
  },
}));

jest.mock("@/services/userService", () => ({
  userService: {
    getCurrentProfile: jest.fn(),
  },
}));

jest.mock("@/hooks/useAppQuery", () => ({
  useAppQuery: jest.fn(),
}));

jest.mock("@/lib/env", () => ({
  env: {
    EXPO_PUBLIC_SERVER_URL: "http://mock-server.com",
    EXPO_PUBLIC_BYPASS_AUTH: "false",
  },
}));

describe("useAuthGuard", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      useAccountStore.getState().clear();
      useAccountStore.setState({ bypassAuth: false });
    });
    (useAppQuery as jest.Mock).mockImplementation((options) => {
      if (options.enabled && typeof options.queryFn === "function") {
        options.queryFn();
      }
      return { data: null, isLoading: false, error: null };
    });
  });

  it("should clear the store and redirect to login if no session is present on a protected route", async () => {
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    const wrapper = createWrapper();
    const { result } = await renderHook(() => useAuthGuard(), { wrapper });

    expect(result.current.isReady).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith("/auth/login");
    expect(useAccountStore.getState().profile).toBeNull();
  });

  it("should not redirect if no session is present but user is already in auth segment", async () => {
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["auth", "login"]);

    const wrapper = createWrapper();
    const { result } = await renderHook(() => useAuthGuard(), { wrapper });

    expect(result.current.isReady).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should fetch profile and redirect to createProfile if user has no profile", async () => {
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "tok" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    const unknownUserError = createStatusError(
      ErrorTypes.UnknownUsernameError,
      "Profile not found",
    );
    (useAppQuery as jest.Mock).mockImplementation((options) => {
      if (options.enabled && typeof options.queryFn === "function") {
        options.queryFn();
      }
      return {
        data: null,
        isLoading: false,
        error: unknownUserError,
      };
    });

    const wrapper = createWrapper();
    const { result } = await renderHook(() => useAuthGuard(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(userService.getCurrentProfile).toHaveBeenCalled();
    expect(useAccountStore.getState().profile).toBeNull();
    expect(useAccountStore.getState().error).toEqual(unknownUserError);
    expect(mockReplace).toHaveBeenCalledWith("/auth/createProfile");
  });

  it("should fetch profile and redirect to calendar if session is active and user is in auth segment", async () => {
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "tok" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["auth", "login"]);

    const mockProfile = {
      username: "johndoe",
      userId: "1",
      description: "Hello",
      photo: null,
      settings: {},
    };
    (useAppQuery as jest.Mock).mockImplementation((options) => {
      if (options.enabled && typeof options.queryFn === "function") {
        options.queryFn();
      }
      return {
        data: mockProfile,
        isLoading: false,
        error: null,
      };
    });

    const wrapper = createWrapper();
    const { result } = await renderHook(() => useAuthGuard(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(useAccountStore.getState().profile).toEqual(mockProfile);
    expect(useAccountStore.getState().error).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith("/(protected)/calendar");
  });

  it("should bypass profile fetching and checks if bypassAuth is active", async () => {
    await act(async () => {
      useAccountStore.setState({ bypassAuth: true });
    });

    (authClient.useSession as jest.Mock).mockReturnValue({
      data: null,
      isPending: true,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    const wrapper = createWrapper();
    const { result } = await renderHook(() => useAuthGuard(), { wrapper });

    expect(result.current.isReady).toBe(true);
    expect(userService.getCurrentProfile).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should not redirect if user has no profile but is already on createProfile screen", async () => {
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "tok" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["auth", "createProfile"]);

    const unknownUserError = createStatusError(
      ErrorTypes.UnknownUsernameError,
      "Profile not found",
    );
    (useAppQuery as jest.Mock).mockImplementation((options) => {
      if (options.enabled && typeof options.queryFn === "function") {
        options.queryFn();
      }
      return {
        data: null,
        isLoading: false,
        error: unknownUserError,
      };
    });

    const wrapper = createWrapper();
    const { result } = await renderHook(() => useAuthGuard(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should not update store if query state has not changed", async () => {
    const setProfileSpy = jest.spyOn(useAccountStore.getState(), "setProfile");

    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "tok" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    const mockProfile = {
      username: "johndoe",
      userId: "1",
      description: "Hello",
      photo: null,
      settings: {},
    };

    (useAppQuery as jest.Mock).mockImplementation((options) => {
      if (options.enabled && typeof options.queryFn === "function") {
        options.queryFn();
      }
      return {
        data: mockProfile,
        isLoading: false,
        error: null,
      };
    });

    const wrapper = createWrapper();
    const { result, rerender } = await renderHook(() => useAuthGuard(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    setProfileSpy.mockClear();

    rerender(undefined);

    expect(setProfileSpy).not.toHaveBeenCalled();
    setProfileSpy.mockRestore();
  });

  it("should not redirect if profile is loaded successfully and user is already on a protected route", async () => {
    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "tok" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    const mockProfile = {
      username: "johndoe",
      userId: "1",
      description: "Hello",
      photo: null,
      settings: {},
    };
    (useAppQuery as jest.Mock).mockImplementation((options) => {
      if (options.enabled && typeof options.queryFn === "function") {
        options.queryFn();
      }
      return {
        data: mockProfile,
        isLoading: false,
        error: null,
      };
    });

    const wrapper = createWrapper();
    const { result } = await renderHook(() => useAuthGuard(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should update store if loading state changes", async () => {
    const setLoadingSpy = jest.spyOn(useAccountStore.getState(), "setLoading");

    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "tok" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    (useAppQuery as jest.Mock).mockImplementation((options) => {
      if (options.enabled && typeof options.queryFn === "function") {
        options.queryFn();
      }
      return {
        data: null,
        isLoading: true,
        error: null,
      };
    });

    const wrapper = createWrapper();
    const { result, rerender } = await renderHook(() => useAuthGuard(), { wrapper });

    await waitFor(() => expect(useAccountStore.getState().loading).toBe(true));
    expect(setLoadingSpy).toHaveBeenCalledWith(true);

    setLoadingSpy.mockClear();

    (useAppQuery as jest.Mock).mockImplementation((options) => {
      return {
        data: null,
        isLoading: false,
        error: null,
      };
    });

    rerender(undefined);

    await waitFor(() => expect(useAccountStore.getState().loading).toBe(false));
    expect(setLoadingSpy).toHaveBeenCalledWith(false);

    setLoadingSpy.mockRestore();
  });

  it("should update store if error state changes", async () => {
    const setErrorSpy = jest.spyOn(useAccountStore.getState(), "setError");

    (authClient.useSession as jest.Mock).mockReturnValue({
      data: { session: { token: "tok" }, user: { id: "1" } },
      isPending: false,
    });
    (useSegments as jest.Mock).mockReturnValue(["(protected)", "calendar"]);

    const mockError = createStatusError(ErrorTypes.UnknownUsernameError, "Error");

    (useAppQuery as jest.Mock).mockImplementation((options) => {
      if (options.enabled && typeof options.queryFn === "function") {
        options.queryFn();
      }
      return {
        data: null,
        isLoading: false,
        error: mockError,
      };
    });

    const wrapper = createWrapper();
    const { result } = await renderHook(() => useAuthGuard(), { wrapper });

    await waitFor(() => expect(useAccountStore.getState().error).toEqual(mockError));
    expect(setErrorSpy).toHaveBeenCalledWith(mockError);

    setErrorSpy.mockRestore();
  });
});
