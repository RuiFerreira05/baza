import { profiles, users } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, getColumns } from 'drizzle-orm';
import type { createUserProfileRequest } from "@baza/shared-types";

// export function getUserById(userId: String) {
//   return db.select().from(users).where(users.id.equals(userId)).first();
// }

export const getUserById = async (username: string) => {
  const { settings, ...rest } = getColumns(profiles)
  const result = await db.select({...rest}).from(profiles).where(eq(profiles.username, username));

  return result;
}

export const createUserProfile = async (userProfile: createUserProfileRequest) => {
  const user = await db.select().from(users).where(eq(users.id, userProfile.userId))

  if(user.length == 1){
    const result = await db.insert(profiles).values({
      username: userProfile.username,
      photo: userProfile.photo,
      description: userProfile.description,
      userId: userProfile.userId,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
      settings: {},
    }).returning();

    return result;
  }
   return null;
}