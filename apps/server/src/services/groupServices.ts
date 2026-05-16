import { groupMembers, groups } from "@baza/db/schemas";
import {
  ErrorTypes,
  groupDTO,
  groupMemberDTO,
  type GroupDTO,
  type GroupMemberDTO,
} from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import { and, eq } from "drizzle-orm";
import { Value } from "typebox/value";
import { db } from "../lib/db";
import { Err, FailableOk, Ok, type Failable, type Result } from "../lib/types";
import { app, fileUploadService } from "../setup";
import Type from "typebox";

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

export const createGroup = async (
  groupName: string,
): Promise<
  Result<
    GroupDTO,
    ErrorTypes.ConversionError | ErrorTypes.ResourceCreationError
  >
> => {
  // have to do this destructuring cause drizzle returns an array with returning()
  const [group] = await db
    .insert(groups)
    .values({
      groupname: groupName,
    })
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

export const deleteGroup = async (
  groupId: string,
): Promise<
  Result<GroupDTO, ErrorTypes.UnknownIdError | ErrorTypes.DeleteError>
> => {
  app.log.info(`Received delete group request for group with id ${groupId}`);
  try {
    const group = await db.transaction(async (tx) => {
      try {
        await tx.delete(groupMembers).where(eq(groupMembers.groupId, groupId));
      } catch (error) {
        app.log.error(
          `Failed to delete group members for group with id ${groupId}: ${(error as Error).message}`,
        );
        tx.rollback();
      }
      try {
        const [group] = await tx
          .delete(groups)
          .where(eq(groups.id, groupId))
          .returning();

        if (!group) {
          app.log.warn(`Group with id ${groupId} not found`);
          tx.rollback();
        }

        const conv = Value.Convert(groupDTO, group);
        if (Value.Check(groupDTO, conv)) {
          return conv;
        } else {
          app.log.error(Value.Errors(groupDTO, conv));
          tx.rollback();
        }
      } catch (error) {
        app.log.error(
          `Failed to delete group with id ${groupId}: ${(error as Error).message}`,
        );
        tx.rollback();
      }
    });
    if (group) {
      return Ok(group);
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
    app.log.warn(`Group or user not found`);
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
    app.log.warn(`Group or user not found`);
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
