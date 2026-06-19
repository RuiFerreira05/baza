import { useSettingsStore, useTheme } from "@/store/useSettingsStore";
import { act, renderHook } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { Appearance } from "react-native";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

describe("useSettingsStore", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await act(async () => {
      useSettingsStore.setState({ themeMode: "system" });
    });
  });

  it("should initialize with themeMode 'system'", async () => {
    const { result } = await renderHook(() => useSettingsStore());
    expect(result.current.themeMode).toBe("system");
  });

  it("should update themeMode when setThemeMode is called", async () => {
    const { result } = await renderHook(() => useSettingsStore());

    await act(async () => {
      result.current.setThemeMode("dark");
    });

    expect(result.current.themeMode).toBe("dark");
  });

  it("should persist themeMode changes to SecureStore", async () => {
    const { result } = await renderHook(() => useSettingsStore());

    await act(async () => {
      result.current.setThemeMode("light");
    });

    // We wait for microtasks so async storage has a chance to execute
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "baza-settings-storage",
      expect.stringContaining('"themeMode":"light"'),
    );
  });

  it("should call deleteItemAsync on SecureStore when storage is cleared", async () => {
    await act(async () => {
      useSettingsStore.persist.clearStorage();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "baza-settings-storage",
    );
  });
});

describe("useTheme hook", () => {
  let colorSchemeSpy: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    colorSchemeSpy = jest.spyOn(Appearance, "getColorScheme");
    await act(async () => {
      useSettingsStore.setState({ themeMode: "system" });
    });
  });

  afterEach(() => {
    colorSchemeSpy.mockRestore();
  });

  it("should resolve isDark to false if mode is system and OS scheme is light", async () => {
    colorSchemeSpy.mockReturnValue("light");

    const { result } = await renderHook(() => useTheme());

    expect(result.current.themeMode).toBe("system");
    expect(result.current.isDark).toBe(false);
    expect(result.current.theme).toBeDefined();
  });

  it("should resolve isDark to true if mode is system and OS scheme is dark", async () => {
    colorSchemeSpy.mockReturnValue("dark");

    const { result } = await renderHook(() => useTheme());

    expect(result.current.themeMode).toBe("system");
    expect(result.current.isDark).toBe(true);
    expect(result.current.theme).toBeDefined();
  });

  it("should resolve isDark to true if themeMode is set explicitly to dark", async () => {
    colorSchemeSpy.mockReturnValue("light");

    const { result: storeResult } = await renderHook(() => useSettingsStore());
    await act(async () => {
      storeResult.current.setThemeMode("dark");
    });

    const { result } = await renderHook(() => useTheme());

    expect(result.current.themeMode).toBe("dark");
    expect(result.current.isDark).toBe(true);
  });

  it("should resolve isDark to false if themeMode is set explicitly to light", async () => {
    colorSchemeSpy.mockReturnValue("dark");

    const { result: storeResult } = await renderHook(() => useSettingsStore());
    await act(async () => {
      storeResult.current.setThemeMode("light");
    });

    const { result } = await renderHook(() => useTheme());

    expect(result.current.themeMode).toBe("light");
    expect(result.current.isDark).toBe(false);
  });
});
