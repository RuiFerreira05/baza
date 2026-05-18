import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, varchar, check, primaryKey, uuid } from "drizzle-orm/pg-core";
import { profiles } from "./profile";

export const groups = pgTable("groups", {
  id: uuid('id').defaultRandom().primaryKey(),
  groupname: varchar("group_name", { length: 64 }).notNull(),
  description: text("description"),
  photo: text("photo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
  (t) => [
    check("group_name_check", sql`${t.groupname} ~ '^[A-Za-z0-9_\\-\\.]{3,}$'`),
  ]
);

export const groupMembers = pgTable("group_members", {
  username: text("username").notNull().references(() => profiles.username, {onDelete: 'cascade'}),
  groupId: uuid("group_id").notNull().references(() => groups.id, {onDelete: 'cascade'}),
  admin: boolean("admin").notNull(),
  banned: boolean("banned").default(false).notNull(),
  bannedAt: timestamp("banned_at"),
  acceptedInvite: boolean("accepted_invite").notNull(),
  acceptedAt: timestamp("accepted_at"),
  invitedAt: timestamp("invited_at").notNull(),
},
  (t) => [
    primaryKey({ columns: [t.username, t.groupId]}),
    check("banned_check", sql`(${t.banned} AND ${t.bannedAt} IS NOT NULL) OR NOT ${t.banned}`),
    check("invite_check", sql`(${t.acceptedInvite} AND ${t.acceptedAt} IS NOT NULL) OR NOT ${t.acceptedInvite}`),
]);