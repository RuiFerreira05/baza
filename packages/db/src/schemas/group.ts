import { defineRelations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, varchar, check, primaryKey } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { groupEvents } from "./event";

export const groups = pgTable("groups", {
  id: text("id").primaryKey(),
  groupname: varchar("group_name", { length: 64 }).notNull(),
  description: text("description"),
  photo: text("photo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
},
  (t) => [
    check("group_name_check", sql`${t.groupname} REGEXP '^[A-Za-z0-9_\'\-\.]{3,}$'`),
  ]
);

export const groupMembers = pgTable("group_members", {
  username: text("username").notNull().references(() => profiles.username),
  groupId: text("group_id").notNull().references(() => groups.id),
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

export const groupRelations = defineRelations(
  {groups, groupMembers, profiles, groupEvents},
  (r) => ({
    groups: {
      groupMembers: r.many.groupMembers(),
      groupEvents: r.many.groupEvents(),
    },
    groupMembers:{
      groups: r.one.groups({
        from: r.groupMembers.groupId,
        to: r.groups.id,
      }),
      profiles: r.one.profiles({
        from: r.groupMembers.username,
        to: r.profiles.username,
      }),
    }
  })
);