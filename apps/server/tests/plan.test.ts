import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";

// Mock auth module before imports
vi.mock("../src/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/auth")>();
  return {
    ...actual,
    getAuthenticatedUsername: vi.fn(),
  };
});

import { getAuthenticatedUsername } from "../src/lib/auth";
import { app } from "../src/setup";
import { db } from "../src/lib/db";
import {
  users,
  profiles,
  groups,
  groupMembers,
  events,
  groupEvents,
  plans,
  votes,
} from "@baza/db/schemas";
import { clearDatabase } from "./helpers/dbHelper";
import { and, eq } from "drizzle-orm";

const VALID_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("Plan Routes", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("testproposer");
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/restricted/groups/:id/events/:idevent/plans/create should propose a plan", async () => {
    await db
      .insert(users)
      .values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testproposer",
      settings: {},
    });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "test_group" })
      .returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testproposer",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const [baseEvent] = await db
      .insert(events)
      .values({
        title: "Event Title",
        description: "Description",
      })
      .returning();

    const [event] = await db
      .insert(groupEvents)
      .values({
        id: baseEvent.id,
        groupId: group.id,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
        createdBy: "testproposer",
        state: "unfinished",
      })
      .returning();

    const response = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans`,
      payload: {
        title: "Proposed Plan",
        date: "2026-08-01",
        startTime: "18:00:00Z",
        endTime: "21:00:00Z",
        activity: "Karaoke",
        location: "Karaoke Bar",
        minBudget: 15,
        maxBudget: 35,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.title).toBe("Proposed Plan");
    expect(body.data.username).toBe("testproposer");
  });

  it("GET /v1/restricted/groups/:id/events/:idevent/plans should list plans", async () => {
    await db
      .insert(users)
      .values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testproposer",
      settings: {},
    });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "test_group" })
      .returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testproposer",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const [baseEvent] = await db
      .insert(events)
      .values({
        title: "Event Title",
        description: "Description",
      })
      .returning();

    const [event] = await db
      .insert(groupEvents)
      .values({
        id: baseEvent.id,
        groupId: group.id,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
        createdBy: "testproposer",
        state: "unfinished",
      })
      .returning();

    const [plan] = await db
      .insert(plans)
      .values({
        groupEventId: event.id,
        username: "testproposer",
        title: "Proposed Plan",
        date: "2026-08-01",
        startTime: "18:00:00",
        endTime: "21:00:00",
        activity: "Karaoke",
        location: "Karaoke Bar",
        minBudget: 15,
        maxBudget: 35,
      })
      .returning();

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe("Proposed Plan");
    expect(body.data[0].votesCount).toBe(0);
  });

  it("GET /v1/restricted/groups/:id/events/:idevent/plans/:idplan should retrieve details", async () => {
    await db
      .insert(users)
      .values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testproposer",
      settings: {},
    });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "test_group" })
      .returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testproposer",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const [baseEvent] = await db
      .insert(events)
      .values({
        title: "Event Title",
        description: "Description",
      })
      .returning();

    const [event] = await db
      .insert(groupEvents)
      .values({
        id: baseEvent.id,
        groupId: group.id,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
        createdBy: "testproposer",
        state: "unfinished",
      })
      .returning();

    const [plan] = await db
      .insert(plans)
      .values({
        groupEventId: event.id,
        username: "testproposer",
        title: "Proposed Plan",
        date: "2026-08-01",
        startTime: "18:00:00",
        endTime: "21:00:00",
        activity: "Karaoke",
        location: "Karaoke Bar",
        minBudget: 15,
        maxBudget: 35,
      })
      .returning();

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans/${plan.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.title).toBe("Proposed Plan");
  });

  it("PATCH /v1/restricted/groups/:id/events/:idevent/plans/:idplan/edit should update plan coordinates", async () => {
    await db
      .insert(users)
      .values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testproposer",
      settings: {},
    });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "test_group" })
      .returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testproposer",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const [baseEvent] = await db
      .insert(events)
      .values({
        title: "Event Title",
        description: "Description",
      })
      .returning();

    const [event] = await db
      .insert(groupEvents)
      .values({
        id: baseEvent.id,
        groupId: group.id,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
        createdBy: "testproposer",
        state: "unfinished",
      })
      .returning();

    const [plan] = await db
      .insert(plans)
      .values({
        groupEventId: event.id,
        username: "testproposer",
        title: "Proposed Plan",
        date: "2026-08-01",
        startTime: "18:00:00",
        endTime: "21:00:00",
        activity: "Karaoke",
        location: "Karaoke Bar",
        minBudget: 15,
        maxBudget: 35,
      })
      .returning();

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans/${plan.id}`,
      payload: {
        title: "Updated Plan Title",
        activity: "Singing",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.title).toBe("Updated Plan Title");
    expect(body.data.activity).toBe("Singing");
  });

  it("POST /v1/restricted/groups/:id/events/:idevent/plans/:idplan/vote and /remove-vote should manage plan approval votes", async () => {
    await db
      .insert(users)
      .values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testproposer",
      settings: {},
    });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "test_group" })
      .returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testproposer",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const [baseEvent] = await db
      .insert(events)
      .values({
        title: "Event Title",
        description: "Description",
      })
      .returning();

    const [event] = await db
      .insert(groupEvents)
      .values({
        id: baseEvent.id,
        groupId: group.id,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
        createdBy: "testproposer",
        state: "unfinished",
      })
      .returning();

    const [plan] = await db
      .insert(plans)
      .values({
        groupEventId: event.id,
        username: "testproposer",
        title: "Proposed Plan",
        date: "2026-08-01",
        startTime: "18:00:00",
        endTime: "21:00:00",
        activity: "Karaoke",
        location: "Karaoke Bar",
        minBudget: 15,
        maxBudget: 35,
      })
      .returning();

    const voteResponse = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans/${plan.id}/votes`,
    });

    expect(voteResponse.statusCode).toBe(200);
    expect(voteResponse.json().status).toBe("OK");

    const [voteCheck] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.planId, plan.id), eq(votes.username, "testproposer")))
      .limit(1);
    expect(voteCheck).toBeDefined();

    const removeResponse = await app.inject({
      method: "DELETE",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans/${plan.id}/votes`,
    });

    expect(removeResponse.statusCode).toBe(200);
    expect(removeResponse.json().status).toBe("OK");

    const [voteCheckAfter] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.planId, plan.id), eq(votes.username, "testproposer")))
      .limit(1);
    expect(voteCheckAfter).toBeUndefined();
  });

  it("POST /v1/restricted/groups/:id/events/:idevent/plans should allow proposing an all-day plan without startTime and endTime", async () => {
    await db
      .insert(users)
      .values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testproposer",
      settings: {},
    });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "test_group" })
      .returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testproposer",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const [baseEvent] = await db
      .insert(events)
      .values({
        title: "Event Title",
        description: "Description",
      })
      .returning();

    const [event] = await db
      .insert(groupEvents)
      .values({
        id: baseEvent.id,
        groupId: group.id,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
        createdBy: "testproposer",
        state: "unfinished",
      })
      .returning();

    const response = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans`,
      payload: {
        title: "All-Day Proposed Plan",
        date: "2026-08-01",
        allDay: true,
        activity: "Karaoke",
        location: "Karaoke Bar",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.allDay).toBe(true);
    expect(body.data.startTime).toBe("00:00:00Z");
    expect(body.data.endTime).toBe("23:59:59Z");
  });

  it("POST /v1/restricted/groups/:id/events/:idevent/plans should fail with 400 if a standard plan lacks startTime or endTime", async () => {
    await db
      .insert(users)
      .values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testproposer",
      settings: {},
    });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "test_group" })
      .returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testproposer",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const [baseEvent] = await db
      .insert(events)
      .values({
        title: "Event Title",
        description: "Description",
      })
      .returning();

    const [event] = await db
      .insert(groupEvents)
      .values({
        id: baseEvent.id,
        groupId: group.id,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
        createdBy: "testproposer",
        state: "unfinished",
      })
      .returning();

    const response = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans`,
      payload: {
        title: "Invalid Proposed Plan",
        date: "2026-08-01",
        activity: "Karaoke",
        location: "Karaoke Bar",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("PATCH /v1/restricted/groups/:id/events/:idevent/plans/:idplan should allow editing a plan to be all-day", async () => {
    await db
      .insert(users)
      .values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testproposer",
      settings: {},
    });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "test_group" })
      .returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testproposer",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const [baseEvent] = await db
      .insert(events)
      .values({
        title: "Event Title",
        description: "Description",
      })
      .returning();

    const [event] = await db
      .insert(groupEvents)
      .values({
        id: baseEvent.id,
        groupId: group.id,
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
        createdBy: "testproposer",
        state: "unfinished",
      })
      .returning();

    const [plan] = await db
      .insert(plans)
      .values({
        groupEventId: event.id,
        username: "testproposer",
        title: "Proposed Plan",
        date: "2026-08-01",
        startTime: "18:00:00",
        endTime: "21:00:00",
        location: "Karaoke Bar",
      })
      .returning();

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/plans/${plan.id}`,
      payload: {
        allDay: true,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.allDay).toBe(true);
    expect(body.data.startTime).toBe("00:00:00Z");
    expect(body.data.endTime).toBe("23:59:59Z");
  });
});
