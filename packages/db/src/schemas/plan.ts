import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, time, integer, primaryKey, check, uuid } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { groupEvents } from "./event";

export const plans = pgTable("plans", {
  id: uuid('id').defaultRandom().primaryKey(),
  groupEventId: uuid("group_event_id").references(() => groupEvents.id, {onDelete: 'cascade'}),
  username: text("username").references(() => profiles.username, { onDelete: 'cascade' }),
  title: varchar("title", { length: 64 }).notNull(),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  activity: text("activity"),
  location: text("location").notNull(),
  minBudget: integer("min_budget"),
  maxBudget: integer("max_budget"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
  (t) => [
    check("time_check", sql`${t.startTime} < ${t.endTime}`),
    check("budget_check", sql`${t.minBudget} < ${t.maxBudget}`)
  ]
);

export const votes = pgTable("votes", {
  planId: uuid("plan_id").references(() => plans.id, { onDelete: 'cascade' }).notNull(),
  username: text("username").references(() => profiles.username, { onDelete: 'cascade' }).notNull(),
},
  (t) => [
    primaryKey({ columns: [t.planId, t.username]}),
  ]
);