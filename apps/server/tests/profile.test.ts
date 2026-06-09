import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { app } from "../src/setup";
import { db } from "../src/lib/db";
import { users, profiles } from "@baza/db/schemas";
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
});
