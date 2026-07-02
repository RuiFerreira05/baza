import { groupMembers, groups } from "@baza/db/schemas";
import {
  Err,
  ErrorTypes,
  FailableOk,
  groupDTO,
  groupMemberDTO,
  Ok,
  type Failable,
  type GroupDTO,
  type GroupMemberDTO,
  type Result,
} from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import { and, eq } from "drizzle-orm";
import Type from "typebox";
import { Value } from "typebox/value";
import { db } from "../lib/db";
import { app, fileUploadService } from "../setup";

/**
 * This method fetches a group from the database by its id, converts it to a groupDTO, and returns
 * it. If no group with the provided id is found, it returns an UnknownIdError. If there is an error
 * converting the group data to the expected format, it returns a ConversionError.
 *
 * @param id groupId
 * @returns a promised result with a groupDTO, or an error
 */
export const getGroupById = async (
  id: string,
): Promise<
  Result<GroupDTO, ErrorTypes.ConversionError | ErrorTypes.UnknownIdError>
> => {
  const group = await db.query.groups.findFirst({
    where: {
      id: id,
    },
  });

  if (group) {
    const conv = Value.Convert(groupDTO, group);
    if (Value.Check(groupDTO, conv)) {
      return Ok(conv);
    } else {
      app.log.error(Value.Errors(groupDTO, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } else {
    return Err(ErrorTypes.UnknownIdError);
  }
};

/**
 * This method creates a new group in the database with the provided name. It then converts
 * the created group to a groupDTO and returns it. If there is an error creating the group,
 * it returns a ResourceCreationError. If there is an error converting the group data to the
 * expected format, it returns a ConversionError.
 *
 * @param groupName the name of the group to create
 * @returns a promised result with the created groupDTO, or an error
 */
export const createGroup = async (
  groupName: string,
  creatorUsername: string,
): Promise<
  Result<
    GroupDTO,
    ErrorTypes.ConversionError | ErrorTypes.ResourceCreationError
  >
> => {
  try {
    const group = await db.transaction(async (tx) => {
      const [newGroup] = await tx
        .insert(groups)
        .values({
          groupname: groupName,
        })
        .returning();

      if (!newGroup) {
        throw new Error("Failed to insert group");
      }

      await tx.insert(groupMembers).values({
        username: creatorUsername,
        groupId: newGroup.id,
        admin: true,
        banned: false,
        acceptedInvite: true,
        acceptedAt: new Date(),
        invitedAt: new Date(),
      });

      return newGroup;
    });

    if (group) {
      const conv = Value.Convert(groupDTO, group);
      if (Value.Check(groupDTO, conv)) {
        return Ok(conv);
      } else {
        app.log.error(Value.Errors(groupDTO, conv));
        return Err(ErrorTypes.ConversionError);
      }
    } else {
      return Err(ErrorTypes.ResourceCreationError);
    }
  } catch (err) {
    app.log.error(err);
    return Err(ErrorTypes.ResourceCreationError);
  }
};

/**
 * This method deletes a group and all its members from the database by the provided groupId.
 * If the group is successfully deleted, it returns the deleted group as a groupDTO.
 * If the group is not found, it returns an UnknownIdError. If there is an error during
 * the deletion process or conversion, it returns a DeleteError.
 *
 * @param groupId the id of the group to delete
 * @returns a promised result with the deleted groupDTO, or an error
 */
export const deleteGroup = async (
  groupId: string,
): Promise<
  Result<GroupDTO, ErrorTypes.UnknownIdError | ErrorTypes.DeleteError>
> => {
  app.log.info(`Received delete group request for group with id ${groupId}`);
  try {
    const groupExists = await db.query.groups.findFirst({
      where: {
        id: groupId,
      },
    });

    if (!groupExists) {
      app.log.warn(`Group with id ${groupId} not found`);
      return Err(ErrorTypes.UnknownIdError);
    }

    const deleted = await db.transaction(async (tx) => {
      await tx.delete(groupMembers).where(eq(groupMembers.groupId, groupId));
      const [group] = await tx
        .delete(groups)
        .where(eq(groups.id, groupId))
        .returning();
      return group;
    });

    if (deleted) {
      const conv = Value.Convert(groupDTO, deleted);
      if (Value.Check(groupDTO, conv)) {
        return Ok(conv);
      } else {
        app.log.error(Value.Errors(groupDTO, conv));
        return Err(ErrorTypes.DeleteError);
      }
    } else {
      return Err(ErrorTypes.DeleteError);
    }
  } catch (error) {
    app.log.error(
      `Failed to delete group with id ${groupId}: ${(error as Error).message}`,
    );
    return Err(ErrorTypes.DeleteError);
  }
};

/**
 * This method updates the photo of a group. It first checks if the group exists, then saves
 * the new photo and updates the group's record in the database. If successful, it returns
 * the updated group as a groupDTO. Possible errors include UnknownIdError if the group
 * doesn't exist, ResourceCreationError if photo saving or database update fails, and
 * ConversionError if the resulting group data cannot be converted to groupDTO.
 *
 * @param groupId the id of the group to update
 * @param photo the new photo file
 * @returns a promised result with the updated groupDTO, or an error
 */
export const editGroupPhoto = async (
  groupId: string,
  photo: MultipartFile,
): Promise<
  Result<
    GroupDTO,
    | ErrorTypes.UnknownIdError
    | ErrorTypes.ResourceCreationError
    | ErrorTypes.ConversionError
  >
> => {
  const groupExists = await db.query.groups.findFirst({
    where: {
      id: groupId,
    },
    columns: {
      photo: true,
    },
  });

  if (!groupExists) {
    app.log.warn(`Group with id ${groupId} not found`);
    return Err(ErrorTypes.UnknownIdError);
  }

  const result = await fileUploadService.saveGroupPhoto(
    photo,
    groupExists.photo,
  );
  if (!result.ok) {
    return Err(ErrorTypes.ResourceCreationError);
  }

  const [group] = await db
    .update(groups)
    .set({
      photo: result.value,
      updatedAt: new Date(),
    })
    .where(eq(groups.id, groupId))
    .returning();

  if (group) {
    const conv = Value.Convert(groupDTO, group);
    if (Value.Check(groupDTO, conv)) {
      return Ok(conv);
    } else {
      app.log.error(Value.Errors(groupDTO, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } else {
    return Err(ErrorTypes.ResourceCreationError);
  }
};

/**
 * This method updates the name and/or description of an existing group. If successful, it
 * returns the updated group as a groupDTO. If no group with the provided id is found, it
 * returns an UnknownIdError. If there is an error converting the group data to the
 * expected format, it returns a ConversionError.
 *
 * @param groupId the id of the group to edit
 * @param groupName the new name for the group (optional)
 * @param description the new description for the group (optional)
 * @returns a promised result with the updated groupDTO, or an error
 */
export const editGroup = async (
  groupId: string,
  groupName: string | undefined,
  description: string | undefined,
): Promise<
  Result<
    GroupDTO,
    | ErrorTypes.UnknownIdError
    | ErrorTypes.ConversionError
    | ErrorTypes.ExistingResourceError
  >
> => {
  const [group] = await db
    .update(groups)
    .set({
      groupname: groupName,
      description: description,
      updatedAt: new Date(),
    })
    .where(eq(groups.id, groupId))
    .returning();

  if (!group) {
    app.log.warn(`Group with id ${groupId} not found`);
    return Err(ErrorTypes.UnknownIdError);
  }

  const conv = Value.Convert(groupDTO, group);
  if (Value.Check(groupDTO, conv)) {
    return Ok(conv);
  } else {
    app.log.error(Value.Errors(groupDTO, conv));
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * This method invites a user to a group by creating a new entry in the groupMembers table.
 * If successful, it returns the new group member as a groupMemberDTO and updates the
 * group's timestamp. If the group or user is not found, it returns an UnknownIdError.
 * If there is an error converting the member data, it returns a ConversionError.
 *
 * @param groupId the id of the group to invite the user to
 * @param username the username of the user to invite
 * @returns a promised result with the new groupMemberDTO, or an error
 */
export const inviteUserToGroup = async (
  groupId: string,
  username: string,
): Promise<
  Result<
    GroupMemberDTO,
    | ErrorTypes.UnknownIdError
    | ErrorTypes.ResourceCreationError
    | ErrorTypes.ConversionError
  >
> => {
  const [groupMember] = await db
    .insert(groupMembers)
    .values({
      username: username,
      groupId: groupId,
      admin: false,
      banned: false,
      acceptedInvite: false,
      invitedAt: new Date(),
    })
    .returning();

  if (!groupMember) {
    app.log.warn("Group or user not found");
    return Err(ErrorTypes.UnknownIdError);
  }

  const conv = Value.Convert(groupMemberDTO, groupMember);
  if (Value.Check(groupMemberDTO, conv)) {
    updateGroupTimestamp(groupId);
    return Ok(conv);
  } else {
    app.log.error(Value.Errors(groupMemberDTO, conv));
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * This method fetches all members of a group by the provided groupId. It converts the
 * members to an array of groupMemberDTOs and returns them. If the group is not found,
 * it returns an UnknownIdError. If there is an error converting the member data, it
 * returns a ConversionError.
 *
 * @param groupId the id of the group whose members to fetch
 * @returns a promised result with an array of groupMemberDTOs, or an error
 */
export const getGroupMembers = async (
  groupId: string,
): Promise<
  Result<
    GroupMemberDTO[],
    ErrorTypes.UnknownIdError | ErrorTypes.ConversionError
  >
> => {
  const members = await db.query.groupMembers.findMany({
    where: {
      groupId: groupId,
    },
  });

  if (members) {
    const check = Type.Array(groupMemberDTO);
    const conv = Value.Convert(check, members);
    if (Value.Check(check, conv)) {
      return Ok(conv);
    } else {
      app.log.error(Value.Errors(check, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } else {
    app.log.warn(`Group with id ${groupId} not found`);
    return Err(ErrorTypes.UnknownIdError);
  }
};

/**
 * This method removes a user from a group by deleting their entry in the groupMembers
 * table. If successful, it returns the removed group member as a groupMemberDTO and
 * updates the group's timestamp. If the group member record is not found, it returns
 * an UnknownIdError. If there is an error converting the data, it returns a ConversionError.
 *
 * @param groupId the id of the group to remove the user from
 * @param username the username of the user to remove
 * @returns a promised result with the removed groupMemberDTO, or an error
 */
export const removeUserFromGroup = async (
  groupId: string,
  username: string,
): Promise<
  Result<GroupMemberDTO, ErrorTypes.UnknownIdError | ErrorTypes.ConversionError>
> => {
  const [groupMember] = await db
    .delete(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.username, username),
      ),
    )
    .returning();

  if (!groupMember) {
    app.log.warn("Group or user not found");
    return Err(ErrorTypes.UnknownIdError);
  }

  const conv = Value.Convert(groupMemberDTO, groupMember);
  if (Value.Check(groupMemberDTO, conv)) {
    updateGroupTimestamp(groupId);
    return Ok(conv);
  } else {
    app.log.error(Value.Errors(groupMemberDTO, conv));
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * This internal method updates the updatedAt timestamp of a group in the database.
 * If the update fails, it logs the error and returns an UpdateError.
 *
 * @param groupId the id of the group to update
 * @returns a promised failable result
 */
const updateGroupTimestamp = async (
  groupId: string,
): Promise<Failable<ErrorTypes.UpdateError>> => {
  try {
    await db
      .update(groups)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(groups.id, groupId));
    return FailableOk();
  } catch (error) {
    app.log.error(
      `Failed to update group timestamp: ${(error as Error).message}`,
    );
    return Err(ErrorTypes.UpdateError);
  }
};

export const promoteUserToAdmin = async (
  groupId: string,
  username: string,
): Promise<
  Result<
    GroupMemberDTO,
    | ErrorTypes.UnknownIdError
    | ErrorTypes.ConversionError
    | ErrorTypes.UpdateError
  >
> => {
  try {
    const [groupMember] = await db
      .update(groupMembers)
      .set({ admin: true })
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.username, username),
        ),
      )
      .returning();

    if (!groupMember) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const conv = Value.Convert(groupMemberDTO, groupMember);
    if (Value.Check(groupMemberDTO, conv)) {
      updateGroupTimestamp(groupId);
      return Ok(conv);
    } else {
      app.log.error(Value.Errors(groupMemberDTO, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      `Failed to promote user to admin: ${(error as Error).message}`,
    );
    return Err(ErrorTypes.UpdateError);
  }
};

export const dismissUserAsAdmin = async (
  groupId: string,
  username: string,
): Promise<
  Result<
    GroupMemberDTO,
    | ErrorTypes.UnknownIdError
    | ErrorTypes.ConversionError
    | ErrorTypes.UpdateError
  >
> => {
  try {
    const [groupMember] = await db
      .update(groupMembers)
      .set({ admin: false })
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.username, username),
        ),
      )
      .returning();

    if (!groupMember) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const conv = Value.Convert(groupMemberDTO, groupMember);
    if (Value.Check(groupMemberDTO, conv)) {
      updateGroupTimestamp(groupId);
      return Ok(conv);
    } else {
      app.log.error(Value.Errors(groupMemberDTO, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      `Failed to dismiss user as admin: ${(error as Error).message}`,
    );
    return Err(ErrorTypes.UpdateError);
  }
};

/**
 * Checks if a user is an active member or admin of a group (accepted invite, not banned).
 */
export const verifyGroupMembership = async (
  groupId: string,
  username: string,
): Promise<boolean> => {
  try {
    const [membership] = await db
      .select({ id: groupMembers.groupId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.username, username),
          eq(groupMembers.acceptedInvite, true),
          eq(groupMembers.banned, false),
        ),
      )
      .limit(1);
    return !!membership;
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to verify group membership",
    );
    return false;
  }
};
