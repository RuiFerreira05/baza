import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@baza/db/schemas";
import { authRelations, profileRelations, groupRelations, eventRelations, planRelations, preferenceRelations } from "./schemas/relations"

export const createDbClient = (connectionString: string) => {
  return drizzle({
    connection: connectionString,
    schema,
    logger: true,
    relations: {
      ...schema.authRelations,
      ...schema.profileRelations,
      ...schema.groupRelations,
      ...schema.eventRelations,
      ...schema.planRelations,
      ...schema.preferenceRelations,
    },
  });
};
