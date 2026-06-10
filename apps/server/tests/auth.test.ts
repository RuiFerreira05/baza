import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";

// Mock auth module
vi.mock("../src/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/auth")>();
  return {
    ...actual,
    getAuthenticatedUsername: vi.fn(),
    auth: {
      ...actual.auth,
      api: {
        ...actual.auth.api,
        getSession: vi.fn(),
      },
    },
  };
});

import { getAuthenticatedUsername, auth } from "../src/lib/auth";
import { app } from "../src/setup";
import { db } from "../src/lib/db";
import { users, profiles, groups, groupMembers } from "@baza/db/schemas";
import { clearDatabase } from "./helpers/dbHelper";

const VALID_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("Authentication & Access Control Middleware", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should block unauthenticated requests to restricted group routes with 401", async () => {
    vi.mocked(getAuthenticatedUsername).mockImplementation(async (req, res) => {
      res.status(401).send({ status: "ERROR", error: "UnauthorizedError" });
      return null;
    });

    const response = await app.inject({
      method: "GET",
      url: "/v1/restricted/groups/123e4567-e89b-12d3-a456-426614174000",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe("UnauthorizedError");
  });

  it("should block profile creation if no session is present", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const response = await app.inject({
      method: "POST",
      url: "/v1/restricted/users",
      headers: {
        "test-force-session-check": "true",
      },
      payload: {
        userId: "22222222-2222-2222-2222-222222222222",
        username: "testuser",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.type).toBe("UnauthorizedError");
  });

  it("should block profile creation if session user ID does not match body userId", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: {
        id: "22222222-2222-2222-2222-222222222222",
        email: "session@example.com",
        emailVerified: true,
        name: "Session User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-id",
        userId: "22222222-2222-2222-2222-222222222222",
        expiresAt: new Date(),
        token: "session-token",
        createdAt: new Date(),
        updatedAt: new Date(),
        userAgent: null,
        ipAddress: null,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/restricted/users",
      headers: {
        "test-force-session-check": "true",
      },
      payload: {
        userId: "33333333-3333-3333-3333-333333333333",
        username: "testuser",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.type).toBe("UnauthorizedError");
  });

  it("should allow profile creation if session user ID matches body userId", async () => {
    const userId = "44444444-4444-4444-4444-444444444444";
    await db.insert(users).values({
      id: userId,
      name: "Matching User",
      email: "matching@example.com",
    });

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: {
        id: userId,
        email: "matching@example.com",
        emailVerified: true,
        name: "Matching User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-id",
        userId: userId,
        expiresAt: new Date(),
        token: "session-token",
        createdAt: new Date(),
        updatedAt: new Date(),
        userAgent: null,
        ipAddress: null,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/restricted/users",
      headers: {
        "test-force-session-check": "true",
      },
      payload: {
        userId: userId,
        username: "matchinguser",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("OK");
    expect(response.json().data.username).toBe("matchinguser");
  });

  /* Access Control (RLS) Tests */

  it("should block group access if user is not a member of the group", async () => {
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("johndoe");

    await db.insert(users).values({ id: VALID_USER_ID, name: "John Doe", email: "john@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "johndoe", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}`,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.type).toBe("UnauthorizedError");
  });

  it("should allow group access if user is an active member of the group", async () => {
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("johndoe");

    await db.insert(users).values({ id: VALID_USER_ID, name: "John Doe", email: "john@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "johndoe", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "test_group" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "johndoe",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("OK");
  });

  it("should allow viewing another user's profile detail (public view)", async () => {
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("johndoe");

    await db.insert(users).values({ id: VALID_USER_ID, name: "John Doe", email: "john@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "johndoe", settings: {} });

    const otherUserId = "22222222-2222-2222-2222-222222222222";
    await db.insert(users).values({ id: otherUserId, name: "Other User", email: "other@example.com" });
    await db.insert(profiles).values({ userId: otherUserId, username: "otheruser", settings: {} });

    const response = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/otheruser",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("OK");
  });

  it("should block accessing another user's settings (private view)", async () => {
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("johndoe");

    await db.insert(users).values({ id: VALID_USER_ID, name: "John Doe", email: "john@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "johndoe", settings: {} });

    const otherUserId = "22222222-2222-2222-2222-222222222222";
    await db.insert(users).values({ id: otherUserId, name: "Other User", email: "other@example.com" });
    await db.insert(profiles).values({ userId: otherUserId, username: "otheruser", settings: {} });

    const response = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/otheruser/settings",
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.type).toBe("UnauthorizedError");
  });

  it("should allow accessing own settings", async () => {
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("johndoe");

    await db.insert(users).values({ id: VALID_USER_ID, name: "John Doe", email: "john@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "johndoe", settings: { theme: "dark" } });

    const response = await app.inject({
      method: "GET",
      url: "/v1/restricted/users/johndoe/settings",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().status).toBe("OK");
    expect(response.json().data.theme).toBe("dark");
  });
});
