import { errorReporter } from "@/lib/errorReporter";

describe("errorReporter", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    // @ts-ignore
    delete global.PromiseRejectionTracking;
  });

  it("should initialize unhandled Promise rejection tracking if available", () => {
    const mockEnable = jest.fn();
    // @ts-ignore
    global.PromiseRejectionTracking = {
      enable: mockEnable,
    };

    errorReporter.initialize();

    expect(mockEnable).toHaveBeenCalledWith(
      expect.objectContaining({
        allRejections: true,
        onUnhandled: expect.any(Function),
      }),
    );

    // Test triggering onUnhandled
    const onUnhandledCallback = mockEnable.mock.calls[0][0].onUnhandled;
    const testError = new Error("Unhandled Promise rejection error");

    onUnhandledCallback("rejection-id", testError);

    expect(consoleErrorSpy).toHaveBeenCalledWith("[Logged Error]:", testError, {
      context: "unhandled_promise_rejection",
    });
  });

  it("should not crash initialize if PromiseRejectionTracking is not defined", () => {
    // @ts-ignore
    delete global.PromiseRejectionTracking;

    expect(() => errorReporter.initialize()).not.toThrow();
  });

  it("should log errors via console.error in development", () => {
    const testError = new Error("Log boundary hit");
    const extraInfo = { details: "some text" };

    errorReporter.logError(testError, extraInfo);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "[Logged Error]:",
      testError,
      extraInfo,
    );
  });

  it("should log errors via console.error in production (non-dev)", () => {
    const originalDev = (globalThis as any).__DEV__;
    // @ts-ignore
    (globalThis as any).__DEV__ = false;
    try {
      const testError = new Error("Production error");
      const extraInfo = { details: "prod details" };
      errorReporter.logError(testError, extraInfo);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Logged Error]:",
        testError,
        extraInfo,
      );
    } finally {
      // @ts-ignore
      global.__DEV__ = originalDev;
    }
  });

  it("should log messages via console.log", () => {
    errorReporter.logMessage("Info message log");
    expect(consoleLogSpy).toHaveBeenCalledWith("[INFO]:", "Info message log");

    errorReporter.logMessage("Warning message log", "warning");
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "[WARNING]:",
      "Warning message log",
    );

    errorReporter.logMessage("Error message log", "error");
    expect(consoleLogSpy).toHaveBeenCalledWith("[ERROR]:", "Error message log");
  });
});
