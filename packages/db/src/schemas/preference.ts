import { pgTable, text, json, boolean, timestamp, primaryKey} from "drizzle-orm/pg-core";
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