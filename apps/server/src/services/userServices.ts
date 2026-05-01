import { profiles, users } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, sql} from 'drizzle-orm';

// export function getUserById(userId: String) {
//   return db.select().from(users).where(users.id.equals(userId)).first();
// }

export const getUserById = async (userId: String) => {
  const result = await db.select({
      username: profiles.username,
      photo: profiles.photo,
      description: profiles.description,
      userId: profiles.userId,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
    }).from(profiles).where(sql`${profiles.userId} = ${userId}`);

  return result
}
