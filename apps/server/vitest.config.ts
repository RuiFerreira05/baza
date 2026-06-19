import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    env: {
      BYPASS_AUTH: "false",
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/baza_test",
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    setupFiles: ["dotenv/config"],
    globalSetup: "./tests/helpers/globalSetup.ts",
    fileParallelism: false, // Run test files sequentially
    maxWorkers: 1, // Use a single worker thread
  },
});
