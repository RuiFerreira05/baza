import { events, personalEvents, profiles, users } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, getColumns } from 'drizzle-orm';

// export const getPersonalEvents = async (username: string) => {
//   const result = await db.query.personalEvents.findMany({
//     with: {
      
//     }
//   });

//   return result;
// }