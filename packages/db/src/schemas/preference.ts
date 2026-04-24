import { defineRelations, sql } from "drizzle-orm";
import { pgTable, text, json, boolean, varchar, timestamp, date, time, integer, primaryKey, check } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { groupEvents } from "./event";

export const preferences = pgTable("preferences", {
  groupEventId: text("group_event_id").references(() => groupEvents.id),
  username: text("username").references(() => profiles.username),
  preference: json("preference").notNull(),
  private: boolean("private").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
},
  (t) => [
    primaryKey({ columns: [t.username, t.groupEventId]}),
  ]
);

export const preferenceRelations = defineRelations(
  {preferences, profiles, groupEvents},
  (r) => ({
    preferences: {
      profiles: r.one.profiles({
        from: r.preferences.username,
        to: r.profiles.username,
      }),
      groupEvents: r.one.groupEvents({
        from: r.preferences.groupEventId,
        to: r.groupEvents.id,
      })
    }
  })
);