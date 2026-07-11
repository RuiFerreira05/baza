// apps/server/src/migrate.ts
import "dotenv/config";
import { env } from "./lib/env";
import { createDbClient } from "@baza/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  console.log("Database connection string present. Initializing database client...");
  const db = createDbClient(env.DATABASE_URL);

  const migrationsFolder = path.resolve(__dirname, "../../packages/db/src/migrations");
  console.log(`Resolving migrations folder path: ${migrationsFolder}`);

  try {
    console.log("Running Drizzle database migrations...");
    await migrate(db, { migrationsFolder });
    console.log("Migrations applied successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

runMigrations();
