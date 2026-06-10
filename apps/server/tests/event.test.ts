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
import { users, profiles, groups, groupMembers, events, groupEvents, plans } from "@baza/db/schemas";
import { clearDatabase } from "./helpers/dbHelper";

const VALID_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("Event Routes", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("testcreator");
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/restricted/groups/:id/events/create should create a group event", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "Creator", email: "creator@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testcreator", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testcreator",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const response = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/events/create`,
      payload: {
        title: "Summer Party",
        description: "Yearly get-together",
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        votingEndTime: "2026-07-31T23:59:59.000Z",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.title).toBe("Summer Party");
    expect(body.data.state).toBe("unfinished");
  });

  it("GET /v1/restricted/groups/:id/events should list group events", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "Creator", email: "creator@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testcreator", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testcreator",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Event One",
      description: "Desc One"
    }).returning();

    await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testcreator",
      state: "unfinished",
    }).returning();

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe("Event One");
  });

  it("GET /v1/restricted/groups/:id/events/:idevent should retrieve details", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "Creator", email: "creator@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testcreator", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testcreator",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Event One",
      description: "Desc One"
    }).returning();

    const [event] = await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testcreator",
      state: "unfinished",
    }).returning();

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.title).toBe("Event One");
  });

  it("PATCH /v1/restricted/groups/:id/events/:idevent/edit should modify group event", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "Creator", email: "creator@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testcreator", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testcreator",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Old Title",
      description: "Old Description"
    }).returning();

    const [event] = await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testcreator",
      state: "unfinished",
    }).returning();

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/edit`,
      payload: {
        title: "New Title",
        description: "New Description",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.title).toBe("New Title");
  });

  it("POST /v1/restricted/groups/:id/events/:idevent/resolve-tie should break a tie", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "Creator", email: "creator@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testcreator", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testcreator",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Tied Event",
      description: "Tied description"
    }).returning();

    const [event] = await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testcreator",
      state: "needs_tiebreaker",
    }).returning();

    const [plan1] = await db.insert(plans).values({
      groupEventId: event.id,
      username: "testcreator",
      title: "Plan A",
      date: "2026-08-01",
      startTime: "12:00",
      endTime: "13:00",
      activity: "Eat pizza",
      location: "Pizzeria",
      minBudget: 10,
      maxBudget: 20,
    }).returning();

    const [plan2] = await db.insert(plans).values({
      groupEventId: event.id,
      username: "testcreator",
      title: "Plan B",
      date: "2026-08-01",
      startTime: "13:00",
      endTime: "14:00",
      activity: "Drink coffee",
      location: "Coffee shop",
      minBudget: 5,
      maxBudget: 10,
    }).returning();

    const response = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/resolve-tie`,
      payload: {
        planId: plan1.id,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("OK");

    const checkEvent = await db.query.groupEvents.findFirst({
      where: (e, { eq }) => eq(e.id, event.id),
    });
    expect(checkEvent?.state).toBe("finished");
  });

  it("should handle event attendance confirmation CRUD operations", async () => {
    // 1. Setup user, profile, group, and member
    await db.insert(users).values({ id: VALID_USER_ID, name: "Creator", email: "creator@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testcreator", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testcreator",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Confirm Event",
      description: "Confirmation test event"
    }).returning();

    const [event] = await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testcreator",
      state: "unfinished",
    }).returning();

    // 2. Confirm attendance
    const confirmRes = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/confirm`,
    });
    expect(confirmRes.statusCode).toBe(200);
    expect(confirmRes.json().status).toBe("OK");
    expect(confirmRes.json().data.groupId).toBe(group.id);
    expect(confirmRes.json().data.username).toBe("testcreator");

    // 3. Get confirmations
    const getConfirmationsRes = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/confirmations`,
    });
    expect(getConfirmationsRes.statusCode).toBe(200);
    expect(getConfirmationsRes.json().status).toBe("OK");
    expect(getConfirmationsRes.json().data).toHaveLength(1);
    expect(getConfirmationsRes.json().data[0].username).toBe("testcreator");

    // 4. Revoke confirmation
    const revokeRes = await app.inject({
      method: "DELETE",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/confirm`,
    });
    expect(revokeRes.statusCode).toBe(200);
    expect(revokeRes.json().status).toBe("OK");

    // 5. Get confirmations again (should be empty)
    const getConfirmationsRes2 = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/confirmations`,
    });
    expect(getConfirmationsRes2.statusCode).toBe(200);
    expect(getConfirmationsRes2.json().data).toHaveLength(0);
  });
});
