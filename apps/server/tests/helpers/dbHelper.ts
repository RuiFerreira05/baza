import { db } from "../../src/lib/db";
import { sql } from "drizzle-orm";

export async function clearDatabase() {
  const tables = [
    "votes",
    "plans",
    "preferences",
    "event_confirmations",
    "personal_events",
    "group_events_final",
    "group_events",
    "events",
    "group_members",
    "groups",
    "friends",
    "profiles",
    "sessions",
    "accounts",
    "verifications",
    "users",
  ];
  for (const table of tables) {
    try {
      await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
    } catch (err) {
      console.error(`Error truncating table ${table}:`, err);
    }
  }
}
