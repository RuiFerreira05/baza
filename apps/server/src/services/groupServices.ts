import { groupMembers, groups } from "@baza/db/schemas";
import {
  ErrorTypes,
  groupDTO,
  groupMemberDTO,
  type GroupDTO,
  type GroupMemberDTO,
} from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import { eq } from "drizzle-orm";
import { Value } from "typebox/value";
import { db } from "../lib/db";
import { Err, Ok, type Result } from "../lib/types";
import { app, fileUploadService } from "../setup";

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
  const groupMember = await db
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
    return Ok(conv);
  } else {
    app.log.error(Value.Errors(groupMemberDTO, conv));
    return Err(ErrorTypes.ConversionError);
  }
};
