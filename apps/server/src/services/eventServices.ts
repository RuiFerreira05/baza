import { events, personalEvents, profiles, users } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, getColumns } from 'drizzle-orm';
import type { createUserProfileRequest } from "@baza/shared-types";

export const getPersonalEvents = async (username: string) => {
  const result = await db.query.personalEvents.findMany({
    with: {
      
    }
  });

  return result;
}