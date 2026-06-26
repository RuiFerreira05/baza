export const errorReporter = {
  initialize: () => {
    // Catch unhandled Promise rejections in JavaScript
    // @ts-ignore
    const globalHandler = global.PromiseRejectionTracking;
    if (globalHandler) {
      globalHandler.enable({
        allRejections: true,
        onUnhandled: (id: string, rejection: any) => {
          errorReporter.logError(rejection, {
            context: "unhandled_promise_rejection",
          });
        },
      });
    }
  },

  logError: (error: Error, extraInfo?: Record<string, any>) => {
    console.error("[Logged Error]:", error, extraInfo);

    if (__DEV__) {
      // In development, let the standard DevLauncher or LogBox display the red box
      return;
    }

    // In production, send this to remote telemetry (e.g. Sentry/Crashlytics)
  },

  logMessage: (
    message: string,
    level: "info" | "warning" | "error" = "info",
  ) => {
    console.log(`[${level.toUpperCase()}]:`, message);

    // In production, send breadcrumbs or messages to remote telemetry
  },
};
