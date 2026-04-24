import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@baza/db/schemas";

export const createDbClient = (connectionString: string) => {
  return drizzle({ connection: connectionString, schema, logger: true });
};