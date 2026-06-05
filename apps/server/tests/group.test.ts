import { describe, it, expect, beforeEach, afterAll } from "vitest";
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
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /v1/restricted/groups/create should create a group", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/v1/restricted/groups/create",
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

  it("GET /v1/restricted/groups/:id should retrieve group details", async () => {
    const [group] = await db.insert(groups).values({
      groupname: "my_group",
    }).returning();

    const response = await app.inject({
      method: "GET",
      url: `/v1/restricted/groups/${group.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("OK");
    expect(body.data.groupname).toBe("my_group");
  });

  it("PATCH /v1/restricted/groups/:id/edit should update group info", async () => {
    const [group] = await db.insert(groups).values({
      groupname: "old_name",
      description: "Old description",
    }).returning();

    const response = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/edit`,
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
    await db.insert(users).values({ id: VALID_USER_ID, name: "User One", email: "one@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "userone", settings: {} });

    const [group] = await db.insert(groups).values({ groupname: "group_alpha" }).returning();

    const inviteResponse = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/group-members/invite-user`,
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
    expect(listBody.data).toHaveLength(1);
    expect(listBody.data[0].username).toBe("userone");
  });

  it("PATCH /v1/restricted/groups/:id/group-members/:username/promote-to-admin and dismiss-admin should work", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "User One", email: "one@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "userone", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "group_alpha" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "userone",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const promoteRes = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/group-members/userone/promote-to-admin`,
    });
    expect(promoteRes.statusCode).toBe(200);
    expect(promoteRes.json().data.admin).toBe(true);

    const dismissRes = await app.inject({
      method: "PATCH",
      url: `/v1/restricted/groups/${group.id}/group-members/userone/dismiss-admin`,
    });
    expect(dismissRes.statusCode).toBe(200);
    expect(dismissRes.json().data.admin).toBe(false);
  });

  it("POST /v1/restricted/groups/:id/group-members/remove-user should kick user", async () => {
    await db.insert(users).values({ id: VALID_USER_ID, name: "User One", email: "one@example.com" });
    await db.insert(profiles).values({ userId: VALID_USER_ID, username: "userone", settings: {} });
    const [group] = await db.insert(groups).values({ groupname: "group_alpha" }).returning();
    await db.insert(groupMembers).values({
      groupId: group.id,
      username: "userone",
      admin: false,
      banned: false,
      acceptedInvite: true,
      acceptedAt: new Date(),
      invitedAt: new Date()
    });

    const removeRes = await app.inject({
      method: "POST",
      url: `/v1/restricted/groups/${group.id}/group-members/remove-user`,
      payload: {
        username: "userone",
      },
    });
    expect(removeRes.statusCode).toBe(200);
    expect(removeRes.json().status).toBe("OK");

    const membersCheck = await db.query.groupMembers.findMany({
      where: (m, { eq }) => eq(m.groupId, group.id),
    });
    expect(membersCheck).toHaveLength(0);
  });

  it("DELETE /v1/restricted/groups/:id/delete should delete group", async () => {
    const [group] = await db.insert(groups).values({ groupname: "to_delete" }).returning();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/v1/restricted/groups/${group.id}/delete`,
    });
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.json().status).toBe("OK");

    const check = await db.query.groups.findFirst({
      where: (g, { eq }) => eq(g.id, group.id),
    });
    expect(check).toBeUndefined();
  });

  it("PATCH /v1/restricted/groups/:id/edit/photo and GET /v1/restricted/groups/:id/photo should work", async () => {
    const [group] = await db.insert(groups).values({ groupname: "photo_group" }).returning();

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
      url: `/v1/restricted/groups/${group.id}/edit/photo`,
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
    const filePath = path.resolve(__dirname, `../uploads/group-photos/${photoId}.png`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
});
