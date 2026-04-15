import { createInsertSchema, createSelectSchema } from "drizzle-orm/typebox";
import { users } from "@baza/db/schemas";
import { Type } from "typebox";

export const userSelectSchema = createSelectSchema(users);
export type User = Type.Static<typeof userSelectSchema>;

export const userInsertSchema = createInsertSchema(users);
export type UserInsert = Type.Static<typeof userInsertSchema>;
