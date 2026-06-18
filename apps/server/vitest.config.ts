import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    env: {
      BYPASS_AUTH: "false",
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    setupFiles: ["dotenv/config"],
    fileParallelism: false, // Run test files sequentially
    maxWorkers: 1,          // Use a single worker thread
  },
});
