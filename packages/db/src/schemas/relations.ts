import { defineRelations, defineRelationsPart } from "drizzle-orm";
import { users, sessions, accounts } from "./auth";
import { profiles, friends } from "./profile";
import { groups, groupMembers } from "./group";
import { personalEvents, groupEvents, groupEventsFinal, events } from "./event";
import { plans, votes } from "./plan";
import { preferences } from "./preference";

export const authRelations = defineRelations(
  { users, sessions, accounts, profiles},
  (r) => ({
    users: {
      sessions: r.many.sessions(),
      accounts: r.many.accounts(),
      profiles: r.one.profiles({
        from: r.users.id,
        to: r.profiles.userId,
      }),
    },
    sessions: {
      users: r.one.users({
        from: r.sessions.userId,
        to: r.users.id,
      }),
    },
    accounts: {
      users: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
  }),
);

export const profileRelations = defineRelationsPart(
  {profiles, users, friends, groupEvents, personalEvents, groupMembers, plans, preferences, votes},
  (r) => ({
    profiles: {
      users: r.one.users({
        from: r.profiles.userId,
        to: r.users.id,
      }),
      friends1: r.many.friends({
        from: r.profiles.username,
        to: r.friends.sentBy,
      }),
      friends2: r.many.friends({
        from: r.profiles.username,
        to: r.friends.receivedBy,
      }),
      groupMembers: r.many.groupMembers({
        from: r.profiles.username,
        to: r.groupMembers.username,
      }),
      personalEvents: r.many.personalEvents({
        from: r.profiles.username,
        to: r.personalEvents.username,
      }),
      groupEvents: r.many.groupEvents({
        from: r.profiles.username,
        to: r.groupEvents.createdBy,
      }),
      plans: r.many.plans({
        from: r.profiles.username,
        to: r.plans.username,
      }),
      votes: r.many.plans({
        from: r.profiles.username.through(r.votes.username),
        to: r.plans.id.through(r.votes.planId),
      }),
      preferences: r.many.preferences({
        from: r.profiles.username,
        to: r.preferences.username,
      }),
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

export const groupRelations = defineRelationsPart(
  {groups, groupMembers, profiles, groupEvents},
  (r) => ({
    groups: {
      groupMembers: r.many.groupMembers(),
      groupEvents: r.many.groupEvents({
        from: r.groups.id,
        to: r.groupEvents.groupId,
      }),
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

export const eventRelations = defineRelationsPart(
  {personalEvents, groupEvents, groupEventsFinal, profiles, groups, plans, preferences, events},
  (r) => ({
    events: {
      personalEvents: r.one.personalEvents({
        from: r.events.id,
        to: r.personalEvents.id
      }),
      groupEvents: r.one.groupEvents({
        from: r.events.id,
        to: r.groupEvents.id
      }),
      groupEventsFinal: r.one.groupEventsFinal({
        from: r.events.id,
        to: r.groupEventsFinal.id
      }),
    },
    personalEvents: {
      profiles: r.one.profiles({
        from: r.personalEvents.username,
        to: r.profiles.username,
      }),
      events: r.one.events({
        from: r.personalEvents.id,
        to: r.events.id
      }),
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
      plans: r.many.plans({
        from: r.groupEvents.id,
        to: r.plans.groupEventId,
      }),
      preferences: r.many.preferences({
        from: r.groupEvents.id,
        to: r.preferences.groupEventId,
      }),
      events: r.one.events({
        from: r.groupEvents.id,
        to: r.events.id
      }),
    },
    groupEventsFinal: {
      groups: r.one.groups({
        from: r.groupEventsFinal.groupId,
        to: r.groups.id,
      }),
      plans: r.one.plans({
        from: r.groupEventsFinal.planId,
        to: r.plans.id,
      }),
      events: r.one.events({
        from: r.groupEventsFinal.id,
        to: r.events.id
      })
    }
  })
);

export const planRelations = defineRelationsPart(
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

export const preferenceRelations = defineRelationsPart(
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