import pg from "pg";
import { createDbClient } from "@baza/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  const testDatabaseUrl =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/baza_test";

  console.log(
    `[Global Setup] Isolating test database: parsing ${testDatabaseUrl}`,
  );

  let testDbName = "baza_test";
  let baseDatabaseUrl = "postgres://postgres:postgres@localhost:5432/postgres";

  try {
    const url = new URL(testDatabaseUrl);
    testDbName = url.pathname.slice(1) || "baza_test";
    url.pathname = "/postgres";
    baseDatabaseUrl = url.toString();
  } catch (err) {
    console.warn(
      "[Global Setup] Failed to parse DATABASE_URL as URL object, using defaults. Error:",
      err,
    );
  }

  console.log(
    `[Global Setup] Connecting to database server to check database: ${testDbName}`,
  );
  const client = new pg.Client({ connectionString: baseDatabaseUrl });
  await client.connect();

  try {
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [testDbName],
    );
    if (res.rowCount === 0) {
      console.log(
        `[Global Setup] Database '${testDbName}' does not exist. Creating...`,
      );
      await client.query(`CREATE DATABASE "${testDbName}"`);
      console.log(
        `[Global Setup] Database '${testDbName}' created successfully.`,
      );
    } else {
      console.log(`[Global Setup] Database '${testDbName}' already exists.`);
    }
  } catch (err) {
    console.error("[Global Setup] Error checking/creating test database:", err);
    throw err;
  } finally {
    await client.end();
  }

  console.log(
    "[Global Setup] Connecting to test database to execute migrations...",
  );
  const db = createDbClient(testDatabaseUrl);

  try {
    // Migrations are located in packages/db/src/migrations relative to the monorepo root
    const migrationsFolder = path.resolve(
      __dirname,
      "../../../../packages/db/src/migrations",
    );
    console.log(`[Global Setup] Running migrations from: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log("[Global Setup] Database migrations applied successfully.");
  } catch (err) {
    console.error(
      "[Global Setup] Failed to apply migrations to test database:",
      err,
    );
    throw err;
  }
}
