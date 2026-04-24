import { defineRelations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, json, pgEnum, primaryKey, check } from "drizzle-orm/pg-core";
import { users } from "./auth";
// import { groupMembers } from "./group";
// import { personalEvents, groupEvents } from "./event";
// import { plans } from "./plan";
// import { preferences } from "./preference";

export const profiles = pgTable("profiles", {
  username: text("username").references(() => users.name).primaryKey(),
  photo: text("photo").references(() => users.image),
  description: text("description"),
  settings: json("settings").notNull(),
  userId: text("user_id").unique().notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
});

export const friendStatusEnum = pgEnum("status", ["accepted", "pending", "rejected", "blocked"]);

export const friends = pgTable("friends", {
  sentBy: text("sent_by").references(() => profiles.username),
  receivedBy: text("received_by").references(() => profiles.username),
  friendStatus: friendStatusEnum("friend_status").notNull(),
  requestAcceptedAt: timestamp("request_accepted_at"),
  requestSentAt: timestamp("request_sent_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
},
  (t) => [
    primaryKey({ columns: [t.sentBy, t.receivedBy]}),
    check("banned_check", sql`((${t.friendStatus} = "accepted" OR ${t.friendStatus} = "blocked") AND ${t.requestAcceptedAt} IS NOT NULL) OR ${t.friendStatus} = "pending" OR ${t.friendStatus} = "rejected"`)
  ]
);

export const profileRelations = defineRelations(
  {profiles, users, friends},
  (r) => ({
    profiles: {
      users: r.one.users({
        from: r.profiles.username,
        to: r.users.name,
      }),
      friends: r.many.friends(),
      // groupMembers: r.many.groupMembers(),
      // personalEvents: r.many.personalEvents(),
      // groupEvents: r.many.groupEvents(),
      // plans: r.many.plans(),
      // votes: r.many.plans(),
      // preferences: r.many.preferences(),
    },
    friends: {
      profile1: r.one.profiles({
        from: r.friends.sentBy,
        to: r.profiles.username,
      }),
      profile2: r.one.profiles({
        from: r.friends.receivedBy,
        to: r.profiles.username,
      })
    }
  })
);