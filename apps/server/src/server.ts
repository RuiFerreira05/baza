// apps/server/src/server.ts
import "dotenv/config";
import { env } from "./lib/env";
import {
  checkAndApplyFallbacks,
  finalizeExpiredEvents,
} from "./services/finalizationService";
import { app } from "./setup";

app.listen(
  { port: parseInt(env.SERVER_PORT), host: env.SERVER_HOST },
  (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(
      `Server running on http://${env.SERVER_HOST}:${env.SERVER_PORT}`,
    );
    console.log(
      `BYPASS_AUTH is ${env.BYPASS_AUTH === "true" ? "enabled" : "disabled"}.`,
    );

    // Background Dynamic Finalization loop (runs every 60 seconds, preventing overlaps)
    let isFinalizing = false;
    const runFinalization = async () => {
      if (isFinalizing) return;
      isFinalizing = true;
      try {
        await finalizeExpiredEvents();
        await checkAndApplyFallbacks();
      } catch (err) {
        app.log.error(err, "Error in background finalization loop");
      } finally {
        isFinalizing = false;
        setTimeout(runFinalization, 60 * 1000);
      }
    };
    setTimeout(runFinalization, 60 * 1000);
  },
);
