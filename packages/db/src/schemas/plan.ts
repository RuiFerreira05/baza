import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, time, integer, primaryKey, check } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { groupEvents } from "./event";

export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  groupEventId: text("group_event_id").references(() => groupEvents.id),
  username: text("username").references(() => profiles.username),
  title: varchar("title", { length: 64 }).notNull(),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  activity: text("activity"),
  location: text("location").notNull(),
  minBudget: integer("min_budget"),
  maxBudget: integer("max_budget"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
},
  (t) => [
    check("time_check", sql`${t.startTime} < ${t.endTime}`),
    check("budget_check", sql`${t.minBudget} < ${t.maxBudget}`)
  ]
);

export const votes = pgTable("votes", {
  planId: text("plan_id").references(() => plans.id),
  username: text("username").references(() => profiles.username),
},
  (t) => [
    primaryKey({ columns: [t.planId, t.username]}),
  ]
);