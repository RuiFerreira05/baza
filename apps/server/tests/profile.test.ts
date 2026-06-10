import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../src/setup";
import { db } from "../src/lib/db";
import { users, profiles, friends, groups, groupMembers, events, personalEvents } from "@baza/db/schemas";
import { clearDatabase } from "./helpers/dbHelper";

const VALID_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("Profile Routes", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/restricted/users/create should create a profile", async () => {
    await db.insert(users).values({
      id: VALID_USER_ID,
      name: "John Doe",
      email: "john@example.com",
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/restricted/users/create",
      payload: {
        userId: VALID_USER_ID,
        username: "johndoe",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.username).toBe("johndoe");
    expect(body.data.userId).toBe(VALID_USER_ID);
  });

  it("GET /v1/restricted/users/:username should retrieve a profile", async () => {
    await db.insert(users).values({
      id: VALID_USER_ID,
      name: "John Doe",
      email: "john@example.com",
    });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "johndoe",
      settings: {},
    });

    const response = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/johndoe",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.username).toBe("johndoe");
  });

  it("GET /v1/restricted/users/:username should return 404 for unknown username", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/nonexistent",
    });
    expect(response.statusCode).toBe(404);
  });

  it("PATCH /v1/restricted/users/:username/edit should edit profile", async () => {
    await db.insert(users).values({
      id: VALID_USER_ID,
      name: "John Doe",
      email: "john@example.com",
    });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "johndoe",
      settings: {},
    });

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/restricted/users/johndoe/edit",
      payload: {
        newUsername: "john_doe",
        newDescription: "New bio details",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.username).toBe("john_doe");
    expect(body.data.description).toBe("New bio details");
  });

  it("DELETE /v1/restricted/users/:username/delete should delete profile", async () => {
    await db.insert(users).values({
      id: VALID_USER_ID,
      name: "John Doe",
      email: "john@example.com",
    });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "johndoe",
      settings: {},
    });

    const response = await app.inject({
      method: "DELETE",
      url: "/v1/restricted/users/johndoe/delete",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");

    const check = await db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.username, "johndoe"),
    });
    expect(check).toBeUndefined();
  });

  it("should handle personal events CRUD", async () => {
    // 1. Seed user and profile
    await db.insert(users).values({
      id: VALID_USER_ID,
      name: "John Doe",
      email: "john@example.com",
    });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "johndoe",
      settings: {},
    });

    // 2. Create personal event
    const createRes = await app.inject({
      method: "POST",
      url: "/v1/restricted/users/johndoe/events/create",
      payload: {
        title: "Workout session",
        description: "Chest day workout",
        date: "2026-06-11",
        location: "Local Gym",
        startTime: "2026-06-11T10:00:00.000Z",
        endTime: "2026-06-11T11:00:00.000Z",
        repeat: "never",
        public: true,
      },
    });

    expect(createRes.statusCode).toBe(201);
    const createBody = createRes.json();
    expect(createBody.status).toBe("OK");
    expect(createBody.data.title).toBe("Workout session");
    const eventId = createBody.data.id;

    // 3. Create personal event with validation failure (startTime >= endTime)
    const failCreateRes = await app.inject({
      method: "POST",
      url: "/v1/restricted/users/johndoe/events/create",
      payload: {
        title: "Invalid times",
        date: "2026-06-11",
        startTime: "2026-06-11T11:00:00.000Z",
        endTime: "2026-06-11T10:00:00.000Z",
        repeat: "never",
        public: true,
      },
    });
    expect(failCreateRes.statusCode).toBe(400);

    // 4. Retrieve single personal event
    const getRes = await app.inject({
      method: "GET",
      url: `/v1/restricted/users/johndoe/events/${eventId}`,
    });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().data.title).toBe("Workout session");

    // 5. Edit personal event
    const editRes = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/users/johndoe/events/${eventId}/edit`,
      payload: {
        title: "Hard Workout Session",
        location: "Home Gym",
      },
    });
    expect(editRes.statusCode).toBe(200);
    const editBody = editRes.json();
    expect(editBody.data.title).toBe("Hard Workout Session");
    expect(editBody.data.location).toBe("Home Gym");
  });

  it("should handle settings retrieval and update", async () => {
    await db.insert(users).values({
      id: VALID_USER_ID,
      name: "John Doe",
      email: "john@example.com",
    });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "johndoe",
      settings: { theme: "light", notifications: true },
    });

    const getRes = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/johndoe/settings",
    });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().data.theme).toBe("light");

    const patchRes = await app.inject({
      method: "PATCH",
      url: "/v1/restricted/users/johndoe/settings",
      payload: { theme: "dark", notifications: false },
    });
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.json().data.theme).toBe("dark");
  });

  it("should handle group listing and invitations", async () => {
    // 1. Seed user and profile
    await db.insert(users).values({
      id: VALID_USER_ID,
      name: "John Doe",
      email: "john@example.com",
    });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "johndoe",
      settings: {},
    });

    // 2. Create active group and invited group
    const groupId1 = "22222222-2222-2222-2222-222222222222";
    const groupId2 = "33333333-3333-3333-3333-333333333333";

    await db.insert(groups).values({
      id: groupId1,
      groupname: "activegroup",
    });
    await db.insert(groups).values({
      id: groupId2,
      groupname: "invitedgroup",
    });

    // Seed groupMembers
    await db.insert(groupMembers).values({
      username: "johndoe",
      groupId: groupId1,
      admin: true,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });
    await db.insert(groupMembers).values({
      username: "johndoe",
      groupId: groupId2,
      admin: false,
      acceptedInvite: false,
      invitedAt: new Date(),
    });

    // 3. Test list groups
    const listRes = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/johndoe/groups",
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json().data.length).toBe(1);
    expect(listRes.json().data[0].groupname).toBe("activegroup");

    // 4. Test list invites
    const invitesRes = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/johndoe/groups/invites",
    });
    expect(invitesRes.statusCode).toBe(200);
    expect(invitesRes.json().data.length).toBe(1);
    expect(invitesRes.json().data[0].groupname).toBe("invitedgroup");

    // 5. Test get group detail
    const detailRes = await app.inject({
      method: "GET",
      url: `/v1/restricted/users/johndoe/groups/${groupId1}`,
    });
    expect(detailRes.statusCode).toBe(200);
    expect(detailRes.json().data.groupname).toBe("activegroup");

    // 6. Test accept group invite
    const acceptRes = await app.inject({
      method: "POST",
      url: `/v1/restricted/users/johndoe/groups/invites/${groupId2}/accept`,
    });
    expect(acceptRes.statusCode).toBe(200);
    expect(acceptRes.json().data.acceptedInvite).toBe(true);

    // Decline invite (seed a new invitation first)
    const groupId3 = "44444444-4444-4444-4444-444444444444";
    await db.insert(groups).values({
      id: groupId3,
      groupname: "rejectedgroup",
    });
    await db.insert(groupMembers).values({
      username: "johndoe",
      groupId: groupId3,
      admin: false,
      acceptedInvite: false,
      invitedAt: new Date(),
    });

    const declineRes = await app.inject({
      method: "POST",
      url: `/v1/restricted/users/johndoe/groups/invites/${groupId3}/decline`,
    });
    expect(declineRes.statusCode).toBe(200);
  });

  it("should handle friends operations", async () => {
    // 1. Seed two users and profiles
    const USER_A_ID = VALID_USER_ID;
    const USER_B_ID = "55555555-5555-5555-5555-555555555555";

    await db.insert(users).values({
      id: USER_A_ID,
      name: "User A",
      email: "usera@example.com",
    });
    await db.insert(profiles).values({
      userId: USER_A_ID,
      username: "usera",
      settings: {},
    });

    await db.insert(users).values({
      id: USER_B_ID,
      name: "User B",
      email: "userb@example.com",
    });
    await db.insert(profiles).values({
      userId: USER_B_ID,
      username: "userb",
      settings: {},
    });

    // 2. Send friend request from usera to userb
    const reqRes = await app.inject({
      method: "POST",
      url: "/v1/restricted/users/usera/friends/sendRequest",
      payload: {
        recipientUsername: "userb",
      },
    });
    expect(reqRes.statusCode).toBe(200);

    // 3. Get pending requests for userb
    const pendingRes = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/userb/friends/requests",
    });
    expect(pendingRes.statusCode).toBe(200);
    expect(pendingRes.json().data.length).toBe(1);
    expect(pendingRes.json().data[0].sender.username).toBe("usera");

    // 4. Accept friend request
    const acceptRes = await app.inject({
      method: "POST",
      url: "/v1/restricted/users/userb/friends/requests/usera/accept",
    });
    expect(acceptRes.statusCode).toBe(200);

    // 5. Get friends list for usera
    const friendsRes = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/usera/friends",
    });
    expect(friendsRes.statusCode).toBe(200);
    expect(friendsRes.json().data.length).toBe(1);
    expect(friendsRes.json().data[0].username).toBe("userb");

    // 6. Get friend profile details
    const friendProfileRes = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/usera/friends/userb",
    });
    expect(friendProfileRes.statusCode).toBe(200);
    expect(friendProfileRes.json().data.username).toBe("userb");

    // 7. Remove friend (unfriend)
    const removeRes = await app.inject({
      method: "POST",
      url: "/v1/restricted/users/usera/friends/userb/remove",
    });
    expect(removeRes.statusCode).toBe(200);

    // Verify friendship is gone
    const checkFriends = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/usera/friends",
    });
    expect(checkFriends.json().data.length).toBe(0);
  });
});

