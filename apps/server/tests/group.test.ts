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
import { users, profiles, groups, groupMembers } from "@baza/db/schemas";
import { clearDatabase } from "./helpers/dbHelper";
import fs from "fs";
import path from "path";

const VALID_USER_ID = "11111111-1111-1111-1111-111111111111";

describe("Group Routes", () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.mocked(getAuthenticatedUsername).mockResolvedValue("testrequester");
    await db.insert(users).values({
      id: VALID_USER_ID,
      name: "User One",
      email: "one@example.com",
    });
    await db.insert(profiles).values({
      userId: VALID_USER_ID,
      username: "testrequester",
      settings: {},
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/restricted/groups/create should create a group", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/restricted/groups",
      payload: {
        groupName: "test_group",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.groupname).toBe("test_group");
    expect(body.data.id).toBeDefined();
  });

  it("GET /v1/restricted/groups/:id should retrieve group details if user is a member", async () => {
    const [group] = await db
      .insert(groups)
      .values({
        groupname: "my_group",
      })
      .returning();

    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testrequester",
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
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.groupname).toBe("my_group");
  });

  it("GET /v1/restricted/groups/:id should return 403 if user is not a member", async () => {
    const [group] = await db
      .insert(groups)
      .values({
        groupname: "my_group",
      })
      .returning();

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}`,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().status).toBe("ERROR");
    expect(response.json().error.type).toBe("UnauthorizedError");
  });

  it("PATCH /v1/restricted/groups/:id/edit should update group info", async () => {
    const [group] = await db
      .insert(groups)
      .values({
        groupname: "old_name",
        description: "Old description",
      })
      .returning();

    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testrequester",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}`,
      payload: {
        groupName: "new_name",
        description: "New description",
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.groupname).toBe("new_name");
    expect(body.data.description).toBe("New description");
  });

  it("POST /v1/restricted/groups/:id/group-members/invite-user and GET /v1/restricted/groups/:id/group-members should manage members", async () => {
    const otherUserId = "22222222-2222-2222-2222-222222222222";
    await db
      .insert(users)
      .values({ id: otherUserId, name: "User Two", email: "two@example.com" });
    await db
      .insert(profiles)
      .values({ userId: otherUserId, username: "userone", settings: {} });

    const [group] = await db
      .insert(groups)
      .values({ groupname: "group_alpha" })
      .returning();

    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testrequester",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const inviteResponse = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/group-members`,
      payload: {
        username: "userone",
      },
    });

    expect(inviteResponse.statusCode).toBe(201);
    expect(inviteResponse.json().status).toBe("OK");

    const listResponse = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/group-members`,
    });

    expect(listResponse.statusCode).toBe(200);
    const listBody = listResponse.json();
    expect(listBody.status).toBe("OK");
    // Should have 2 members: testrequester (admin) and invited userone
    expect(listBody.data).toHaveLength(2);
    const usernames = listBody.data.map((m: any) => m.username);
    expect(usernames).toContain("testrequester");
    expect(usernames).toContain("userone");
  });

  it("PATCH /v1/restricted/groups/:id/group-members/:username/promote-to-admin and dismiss-admin should work", async () => {
    const otherUserId = "22222222-2222-2222-2222-222222222222";
    await db
      .insert(users)
      .values({ id: otherUserId, name: "User Two", email: "two@example.com" });
    await db
      .insert(profiles)
      .values({ userId: otherUserId, username: "userone", settings: {} });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "group_alpha" })
      .returning();

    // Add caller testrequester as admin
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testrequester",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "userone",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const promoteRes = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/group-members/userone`,
      payload: { admin: true },
    });
    expect(promoteRes.statusCode).toBe(200);
    expect(promoteRes.json().data.admin).toBe(true);

    const dismissRes = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/group-members/userone`,
      payload: { admin: false },
    });
    expect(dismissRes.statusCode).toBe(200);
    expect(dismissRes.json().data.admin).toBe(false);
  });

  it("POST /v1/restricted/groups/:id/group-members/remove-user should kick user", async () => {
    const otherUserId = "22222222-2222-2222-2222-222222222222";
    await db
      .insert(users)
      .values({ id: otherUserId, name: "User Two", email: "two@example.com" });
    await db
      .insert(profiles)
      .values({ userId: otherUserId, username: "userone", settings: {} });
    const [group] = await db
      .insert(groups)
      .values({ groupname: "group_alpha" })
      .returning();

    // Add caller testrequester as admin
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testrequester",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "userone",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const removeRes = await app.inject({
      method: "DELETE",
      url: `/v1/restricted/groups/${group.id}/group-members/userone`,
    });
    expect(removeRes.statusCode).toBe(200);
    expect(removeRes.json().status).toBe("OK");

    const membersCheck = await db.query.groupMembers.findMany({
      where: {
        groupId: group.id,
      },
    });
    // Only testrequester should remain
    expect(membersCheck).toHaveLength(1);
    expect(membersCheck[0].username).toBe("testrequester");
  });

  it("DELETE /v1/restricted/groups/:id/delete should delete group", async () => {
    const [group] = await db
      .insert(groups)
      .values({ groupname: "to_delete" })
      .returning();

    // Add caller testrequester as admin
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testrequester",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/v1/restricted/groups/${group.id}`,
    });
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.json().status).toBe("OK");

    const check = await db.query.groups.findFirst({
      where: {
        id: group.id,
      },
    });
    expect(check).toBeUndefined();
  });

  it("PATCH /v1/restricted/groups/:id/edit/photo and GET /v1/restricted/groups/:id/photo should work", async () => {
    const [group] = await db
      .insert(groups)
      .values({ groupname: "photo_group" })
      .returning();

    // Add caller testrequester as member
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "testrequester",
      admin: true,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date(),
    });

    const boundary = "------WebKitFormBoundaryTest";
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="photo"; filename="test.png"',
      "Content-Type: image/png",
      "",
      "dummy-image-bytes",
      `--${boundary}--`,
      "",
    ].join("\r\n");

    const uploadRes = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/photo`,
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });

    expect(uploadRes.statusCode).toBe(201);
    expect(uploadRes.json().status).toBe("OK");

    const getPhotoRes = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}/photo`,
    });
    expect(getPhotoRes.statusCode).toBe(200);
    expect(getPhotoRes.body).toBeDefined();

    const photoId = uploadRes.json().data.photo;
    const filePath = path.resolve(
      __dirname,
      `../uploads/group-photos/${photoId}.png`,
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
});
