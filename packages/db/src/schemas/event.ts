import { defineRelations, sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, time, boolean, pgEnum, primaryKey, check } from "drizzle-orm/pg-core";
import { profiles } from "./profile";
import { groups } from "./group";
import { plans } from "./plan";
import { preferences } from "./preference";

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 64 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

export const repeatEnum = pgEnum("every", ["day", "week", "month", "year", "never"]);

export const personalEvents = pgTable("personal_events", {
  id: text("id").references(() => events.id),
  username: text("username").references(() => profiles.username),
  date: date("date").notNull(),
  location: text("location"),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  repeat: repeatEnum("repeat").notNull(),
  public: boolean("public").notNull(),
},
  (t) => [
    primaryKey({ columns: [t.id, t.username]}),
    check("time_check", sql`${t.startTime} < ${t.endTime}`)
  ]
);

export const stateEnum = pgEnum("state", ["finished", "unfinished"]);

export const groupEvents = pgTable("group_events", {
  id: text("id").references(() => events.id),
  groupId: text("group_id").references(() => groups.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  state: stateEnum("state").notNull(),
  votingEndTime: timestamp("voting_end_time"),
  createdBy: text("createdBy").notNull().references(() => profiles.username),
},
  (t) => [
    primaryKey({ columns: [t.id, t.groupId]}),
    check("voting_time_check", sql`((${t.votingEndTime} > CURRENT_TIMESTAMP()) AND ${t.state} = "unfinished") OR 
         ((${t.votingEndTime} < CURRENT_TIMESTAMP()) AND ${t.state} = "finished")`)
  ]
);

export const groupEventsFinal = pgTable("group_events_final", {
  id: text("id").references(() => events.id).primaryKey(),
  groupId: text("group_id").references(() => groups.id),
  planId: text("plan_id").references(() => plans.id)
},
  (t) => [
    primaryKey({ columns: [t.id, t.groupId]}),
  ]
);

export const eventConfirmations = pgTable("event_confirmations", {
  groupId: text("group_id").references(() => groups.id),
  username: text("username").references(() => profiles.username),
  confirmedAt: text("confirmed_at").notNull(),
},
  (t) => [
    primaryKey({ columns: [t.groupId, t.username]}),
  ]
);


export const eventRelations = defineRelations(
  {personalEvents, groupEvents, groupEventsFinal, profiles, groups, plans, preferences},
  (r) => ({
    personalEvents: {
      profiles: r.one.profiles({
        from: r.personalEvents.username,
        to: r.profiles.username,
      })
    },
    groupEvents: {
      groups: r.one.groups({
        from: r.groupEvents.groupId,
        to: r.groups.id,
      }),
      profiles: r.one.profiles({
        from: r.groupEvents.createdBy,
        to: r.profiles.username,
      }),
      plans: r.many.plans(),
      preferences: r.many.plans(),
    },
    groupEventsFinal: {
      groups: r.one.groups({
        from: r.groupEventsFinal.groupId,
        to: r.groups.id,
      }),
      plans: r.one.plans({
        from: r.groupEventsFinal.planId,
        to: r.plans.id,
      })
    }
  })
);