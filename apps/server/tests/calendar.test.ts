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
import { users, profiles, groups, groupMembers, events, groupEvents, personalEvents } from "@baza/db/schemas";
import { clearDatabase } from "./helpers/dbHelper";

const VALID_USER_ID_1 = "11111111-1111-1111-1111-111111111111";
const VALID_USER_ID_2 = "22222222-2222-2222-2222-222222222222";

describe("Calendar Routes", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("testrequester");
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /v1/restricted/groups/:id/calendar should return 404 for unknown group", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/restricted/groups/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/calendar",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().status).toBe("ERROR");
    expect(response.json().error.type).toBe("UnknownIdError");
  });

  it("GET /v1/restricted/groups/:id/calendar should return 403 for non-group member", async () => {
    await db.insert(users).values({ id: VALID_USER_ID_1, name: "Requester", email: "requester@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID_1, username: "testrequester", settings: {} });
    
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/calendar`,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().status).toBe("ERROR");
    expect(response.json().error.type).toBe("UnauthorizedError");
  });

  it("GET /v1/restricted/groups/:id/calendar should return combined calendar and apply masking rules", async () => {
    // 1. Create users & profiles
    await db.insert(users).values([
      { id: VALID_USER_ID_1, name: "Requester", email: "requester@example.com" },
      { id: VALID_USER_ID_2, name: "Other User", email: "other@example.com" }
    ]);
    await db.insert(profiles).values([
      { userId: VALID_USER_ID_1, username: "testrequester", settings: {} },
      { userId: VALID_USER_ID_2, username: "otheruser", settings: {} }
    ]);

    // 2. Create group and membership (both accepted)
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values([
      {
        groupId: group.id,
        username: "testrequester",
        admin: true,
        banned: false,
        acceptedInvite: true,
        acceptedAt: new Date(),
        invitedAt: new Date()
      },
      {
        groupId: group.id,
        username: "otheruser",
        admin: false,
        banned: false,
        acceptedInvite: true,
        acceptedAt: new Date(),
        invitedAt: new Date()
      }
    ]);

    // 3. Insert group event
    const [baseGroupEvent] = await db.insert(events).values({
      title: "Group Meeting",
      description: "Discuss project details"
    }).returning();
    await db.insert(groupEvents).values({
      id: baseGroupEvent.id,
      groupId: group.id,
      startDate: "2026-06-10",
      endDate: "2026-06-11",
      state: "unfinished",
      votingEndTime: new Date("2026-06-09T23:59:59.000Z"),
      createdBy: "testrequester"
    });

    // 4. Insert requester's private personal event (should be fully unmasked for him)
    const [basePersonalRequester] = await db.insert(events).values({
      title: "Dentist Appointment",
      description: "Clean up"
    }).returning();
    await db.insert(personalEvents).values({
      id: basePersonalRequester.id,
      username: "testrequester",
      date: "2026-06-10",
      location: "Dentist Clinic",
      startTime: new Date("2026-06-10T09:00:00.000Z"),
      endTime: new Date("2026-06-10T10:00:00.000Z"),
      repeat: "never",
      public: false
    });

    // 5. Insert other user's public personal event (should be fully unmasked)
    const [basePersonalOtherPublic] = await db.insert(events).values({
      title: "Other Public Event",
      description: "Public Description"
    }).returning();
    await db.insert(personalEvents).values({
      id: basePersonalOtherPublic.id,
      username: "otheruser",
      date: "2026-06-10",
      location: "Central Park",
      startTime: new Date("2026-06-10T11:00:00.000Z"),
      endTime: new Date("2026-06-10T12:00:00.000Z"),
      repeat: "never",
      public: true
    });

    // 6. Insert other user's private personal event (should be masked)
    const [basePersonalOtherPrivate] = await db.insert(events).values({
      title: "Other Private Session",
      description: "Private details"
    }).returning();
    await db.insert(personalEvents).values({
      id: basePersonalOtherPrivate.id,
      username: "otheruser",
      date: "2026-06-10",
      location: "Private Studio",
      startTime: new Date("2026-06-10T14:00:00.000Z"),
      endTime: new Date("2026-06-10T15:00:00.000Z"),
      repeat: "never",
      public: false
    });

    // 7. Fire API Request
    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/calendar`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.groupEvents).toHaveLength(1);
    expect(body.data.memberEvents).toHaveLength(3);

    // Group event assertions
    const grpEv = body.data.groupEvents[0];
    expect(grpEv.title).toBe("Group Meeting");
    expect(grpEv.description).toBe("Discuss project details");

    // Requester's private event assertions (UNMASKED)
    const reqPrivEv = body.data.memberEvents.find((e: any) => e.username === "testrequester");
    expect(reqPrivEv).toBeDefined();
    expect(reqPrivEv.title).toBe("Dentist Appointment");
    expect(reqPrivEv.description).toBe("Clean up");
    expect(reqPrivEv.location).toBe("Dentist Clinic");
    expect(reqPrivEv.public).toBe(false);

    // Other user's public event assertions (UNMASKED)
    const otherPubEv = body.data.memberEvents.find((e: any) => e.username === "otheruser" && e.public === true);
    expect(otherPubEv).toBeDefined();
    expect(otherPubEv.title).toBe("Other Public Event");
    expect(otherPubEv.description).toBe("Public Description");
    expect(otherPubEv.location).toBe("Central Park");

    // Other user's private event assertions (MASKED)
    const otherPrivEv = body.data.memberEvents.find((e: any) => e.username === "otheruser" && e.public === false);
    expect(otherPrivEv).toBeDefined();
    expect(otherPrivEv.title).toBe("Busy");
    expect(otherPrivEv.description).toBeNull();
    expect(otherPrivEv.location).toBeNull();
  });

  it("GET /v1/restricted/groups/:id/calendar should filter events by date range", async () => {
    await db.insert(users).values({ id: VALID_USER_ID_1, name: "Requester", email: "requester@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID_1, username: "testrequester", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testrequester",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    // 1. Group event inside date range
    const [baseGroupEvent1] = await db.insert(events).values({ title: "Event Inside" }).returning();
    await db.insert(groupEvents).values({
      id: baseGroupEvent1.id,
      groupId: group.id,
      startDate: "2026-06-10",
      endDate: "2026-06-11",
      state: "unfinished",
      createdBy: "testrequester"
    });

    // 2. Group event outside date range (after)
    const [baseGroupEvent2] = await db.insert(events).values({ title: "Event Outside" }).returning();
    await db.insert(groupEvents).values({
      id: baseGroupEvent2.id,
      groupId: group.id,
      startDate: "2026-06-25",
      endDate: "2026-06-26",
      state: "unfinished",
      createdBy: "testrequester"
    });

    // 3. Personal event inside date range
    const [basePersonalEvent1] = await db.insert(events).values({ title: "Personal Inside" }).returning();
    await db.insert(personalEvents).values({
      id: basePersonalEvent1.id,
      username: "testrequester",
      date: "2026-06-10",
      startTime: new Date("2026-06-10T10:00:00.000Z"),
      endTime: new Date("2026-06-10T11:00:00.000Z"),
      repeat: "never",
      public: true
    });

    // 4. Personal event outside date range (before)
    const [basePersonalEvent2] = await db.insert(events).values({ title: "Personal Outside" }).returning();
    await db.insert(personalEvents).values({
      id: basePersonalEvent2.id,
      username: "testrequester",
      date: "2026-06-01",
      startTime: new Date("2026-06-01T10:00:00.000Z"),
      endTime: new Date("2026-06-01T11:00:00.000Z"),
      repeat: "never",
      public: true
    });

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/calendar?startDate=2026-06-05&endDate=2026-06-20`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.groupEvents).toHaveLength(1);
    expect(body.data.groupEvents[0].title).toBe("Event Inside");
    expect(body.data.memberEvents).toHaveLength(1);
    expect(body.data.memberEvents[0].title).toBe("Personal Inside");
  });
});
