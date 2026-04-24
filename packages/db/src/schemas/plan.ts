import { defineRelations, sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, time, integer, primaryKey, check } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { groupEvents, groupEventsFinal } from "./event";

export const plans = pgTable("plans", {
  id: text("id"),
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
    primaryKey({ columns: [t.id, t.username, t.groupEventId]}),
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

export const planRelations = defineRelations(
  {plans, profiles, groupEvents, groupEventsFinal, votes},
  (r) => ({
    plans: {
      groupEvents: r.one.groupEvents({
        from: r.plans.groupEventId,
        to: r.groupEvents.id
      }),
      groupEventsFinal: r.one.groupEventsFinal({
        from: r.plans.id,
        to: r.groupEventsFinal.planId,
      }),
      profiles: r.one.profiles({
        from: r.plans.username,
        to: r.profiles.username,
      }),
      votes: r.many.profiles({
        from: r.plans.id.through(r.votes.planId),
        to: r.profiles.username.through(r.votes.username),
      })
    }
  })
);