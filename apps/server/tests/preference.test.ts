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
import { users, profiles, groups, groupMembers, events, groupEvents, preferences } from "@baza/db/schemas";
import { clearDatabase } from "./helpers/dbHelper";

const VALID_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("Preference Routes", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("testuser");
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/restricted/groups/:id/events/:idevent/preferences/create should create availability preferences", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testuser", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testuser",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Pizza Party",
      description: "Pizza description"
    }).returning();

    const [event] = await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testuser",
      state: "unfinished",
    }).returning();

    const response = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/preferences/create`,
      payload: {
        preference: {
          availableDates: ["2026-08-01"],
          activities: ["Eat pizza"],
          minBudget: 10,
          maxBudget: 25,
        },
        private: false,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.username).toBe("testuser");
    expect(body.data.private).toBe(false);
    expect(body.data.preference.availableDates).toContain("2026-08-01");
  });

  it("GET /v1/restricted/groups/:id/events/:idevent/preferences/group should return aggregation report", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testuser", settings: {} });

    const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
    await db.insert(users).values({ id: OTHER_USER_ID, name: "Other User", email: "other@example.com" });
    await db.insert(profiles).values({ userId: OTHER_USER_ID, username: "otheruser", settings: {} });

    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testuser",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "otheruser",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Pizza Party",
      description: "Pizza description"
    }).returning();

    const [event] = await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testuser",
      state: "unfinished",
    }).returning();

    await db.insert(preferences).values({
      groupEventId: event.id,
      username: "testuser",
      preference: {
        availableDates: ["2026-08-01"],
        activities: ["Eat pizza", "Drink soda"],
        minBudget: 10,
        maxBudget: 25,
      },
      private: false,
    });

    await db.insert(preferences).values({
      groupEventId: event.id,
      username: "otheruser",
      preference: {
        availableDates: ["2026-08-01", "2026-08-02"],
        activities: ["Eat pizza", "Board games"],
        minBudget: 15,
        maxBudget: 30,
      },
      private: false,
    });

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/preferences/group`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.totalResponses).toBe(2);
    expect(body.data.dateAvailability["2026-08-01"]).toBe(2);
    expect(body.data.dateAvailability["2026-08-02"]).toBe(1);
    expect(body.data.preferredActivities["Eat pizza"]).toBe(2);
    expect(body.data.budgetRange.min).toBe(15);
    expect(body.data.budgetRange.max).toBe(25);
  });

  it("GET /v1/restricted/groups/:id/events/:idevent/preferences/all should return all preferences", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testuser", settings: {} });

    const OTHER_USER_ID = "22222222-2222-2222-2222-222222222222";
    await db.insert(users).values({ id: OTHER_USER_ID, name: "Other User", email: "other@example.com" });
    await db.insert(profiles).values({ userId: OTHER_USER_ID, username: "otheruser", settings: {} });

    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testuser",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "otheruser",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Pizza Party",
      description: "Pizza description"
    }).returning();

    const [event] = await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testuser",
      state: "unfinished",
    }).returning();

    await db.insert(preferences).values({
      groupEventId: event.id,
      username: "testuser",
      preference: { availableDates: ["2026-08-01"] },
      private: false,
    });

    await db.insert(preferences).values({
      groupEventId: event.id,
      username: "otheruser",
      preference: { availableDates: ["2026-08-01"] },
      private: true,
    });

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/preferences/all`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data).toHaveLength(1);
    expect(body.data[0].username).toBe("testuser");
  });

  it("GET /v1/restricted/groups/:id/events/:idevent/preferences/:username should return specific preference", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "User", email: "user@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "testuser", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testuser",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const [baseEvent] = await db.insert(events).values({
      title: "Pizza Party",
      description: "Pizza description"
    }).returning();

    const [event] = await db.insert(groupEvents).values({
      id: baseEvent.id,
      groupId: group.id,
      startDate: "2026-08-01",
      endDate: "2026-08-02",
      votingEndTime: new Date("2026-07-31T23:59:59.000Z"),
      createdBy: "testuser",
      state: "unfinished",
    }).returning();

    await db.insert(preferences).values({
      groupEventId: event.id,
      username: "testuser",
      preference: { availableDates: ["2026-08-01"] },
      private: false,
    });

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/events/${event.id}/preferences/testuser`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.username).toBe("testuser");
  });
});
