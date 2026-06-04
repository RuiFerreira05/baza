// apps/server/src/server.ts
import "dotenv/config";
import { env } from "./lib/env";
import { app } from "./setup";
import { finalizeExpiredEvents, checkAndApplyFallbacks } from "./services/finalizationService";

app.listen({ port: parseInt(env.SERVER_PORT), host: env.SERVER_HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log("Server running on http://localhost:" + env.SERVER_PORT);

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
});
