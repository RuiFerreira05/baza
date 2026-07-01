import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, time, boolean, pgEnum, primaryKey, check, uuid } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { groups } from "./group";
import { plans } from "./plan";
import { timeStamp } from "node:console";

export const events = pgTable("events", {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar("title", { length: 64 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const repeatEnum = pgEnum("every", ['day', 'week', 'month', 'year', 'never']);

export const personalEvents = pgTable("personal_events", {
  id: uuid("id").references(() => events.id).notNull(),
  username: text("username").references(() => profiles.username).notNull(),
  date: date("date").notNull(),
  location: text("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  allDay: boolean("all_day").default(false).notNull(),
  repeat: repeatEnum("repeat").notNull(),
  repeatUntil: date("repeat_until"),
  public: boolean("public").notNull(),
},
  (t) => [
    primaryKey({ columns: [t.id, t.username]}),
    check("time_check", sql`${t.startTime} < ${t.endTime}`)
  ]
);

export const stateEnum = pgEnum("state", ['finished', 'unfinished', 'needs_tiebreaker']);

export const groupEvents = pgTable("group_events", {
  id: uuid("id").references(() => events.id).primaryKey(),
  groupId: uuid("group_id").references(() => groups.id, {onDelete: 'cascade'}),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  state: stateEnum("state").notNull(),
  votingEndTime: timestamp("voting_end_time", { withTimezone: true }),
  createdBy: text("createdBy").notNull().references(() => profiles.username, { onDelete: 'cascade' }),
});

export const groupEventsFinal = pgTable("group_events_final", {
  id: uuid("id").references(() => events.id, {onDelete: 'cascade'}).primaryKey(),
  groupId: uuid("group_id").references(() => groups.id, {onDelete: 'cascade'}),
  planId: uuid("plan_id").references(() => plans.id, {onDelete: 'cascade'})
});

export const eventConfirmations = pgTable("event_confirmations", {
  groupId: uuid("group_id").references(() => groups.id, {onDelete: 'cascade'}).notNull(),
  username: text("username").references(() => profiles.username, {onDelete: 'cascade'}).notNull(),
  confirmedAt: text("confirmed_at").notNull(),
},
  (t) => [
    primaryKey({ columns: [t.groupId, t.username]}),
  ]
);