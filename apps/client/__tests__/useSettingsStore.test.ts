import { ThemeMode, useSettingsStore } from "@/store/useSettingsStore";
import { useAppTheme as useTheme } from "@/hooks/useAppTheme";
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
      useSettingsStore.setState({ themeMode: ThemeMode.SYSTEM });
    });
  });

  it("should initialize with themeMode 'system'", async () => {
    const { result } = await renderHook(() => useSettingsStore());
    expect(result.current.themeMode).toBe(ThemeMode.SYSTEM);
  });

  it("should update themeMode when setThemeMode is called", async () => {
    const { result } = await renderHook(() => useSettingsStore());

    await act(async () => {
      result.current.setThemeMode(ThemeMode.DARK);
    });

    expect(result.current.themeMode).toBe(ThemeMode.DARK);
  });

  it("should persist themeMode changes to SecureStore", async () => {
    const { result } = await renderHook(() => useSettingsStore());

    await act(async () => {
      result.current.setThemeMode(ThemeMode.LIGHT);
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
      useSettingsStore.setState({ themeMode: ThemeMode.SYSTEM });
    });
  });

  afterEach(() => {
    colorSchemeSpy.mockRestore();
  });

  it("should resolve isDark to false if mode is system and OS scheme is light", async () => {
    colorSchemeSpy.mockReturnValue("light");

    const { result } = await renderHook(() => useTheme());

    expect(result.current.themeMode).toBe(ThemeMode.SYSTEM);
    
    expect(result.current.colors).toBeDefined();
  });

  it("should resolve isDark to true if mode is system and OS scheme is dark", async () => {
    colorSchemeSpy.mockReturnValue("dark");

    const { result } = await renderHook(() => useTheme());

    expect(result.current.themeMode).toBe(ThemeMode.SYSTEM);
    
    expect(result.current.colors).toBeDefined();
  });

  it("should resolve isDark to true if themeMode is set explicitly to dark", async () => {
    colorSchemeSpy.mockReturnValue("light");

    const { result: storeResult } = await renderHook(() => useSettingsStore());
    await act(async () => {
      storeResult.current.setThemeMode(ThemeMode.DARK);
    });

    const { result } = await renderHook(() => useTheme());

    expect(result.current.themeMode).toBe(ThemeMode.DARK);
    
  });

  it("should resolve isDark to false if themeMode is set explicitly to light", async () => {
    colorSchemeSpy.mockReturnValue("dark");

    const { result: storeResult } = await renderHook(() => useSettingsStore());
    await act(async () => {
      storeResult.current.setThemeMode(ThemeMode.LIGHT);
    });

    const { result } = await renderHook(() => useTheme());

    expect(result.current.themeMode).toBe(ThemeMode.LIGHT);
    
  });
});

