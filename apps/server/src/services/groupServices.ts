import { groups } from "@baza/db/schemas";
import { ErrorTypes, groupDTO, type GroupDTO } from "@baza/shared-types";
import { randomUUID, type UUID } from "crypto";
import { Value } from "typebox/value";
import { db } from "../lib/db";
import { Err, Ok, type Result } from "../lib/types";
import type { MultipartFile } from "@fastify/multipart";
import { eq } from "drizzle-orm";
import { fileUploadService } from "../server";
import { app } from "../setup";

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
      console.error(Value.Errors(groupDTO, conv));
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
      id: randomUUID(),
      groupname: groupName,
    })
    .returning();

  if (group) {
    const conv = Value.Convert(groupDTO, group);
    if (Value.Check(groupDTO, conv)) {
      return Ok(conv);
    } else {
      console.error(Value.Errors(groupDTO, conv));
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

  const result = await fileUploadService.saveGroupPhoto(photo, groupExists.photo);
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
      console.error(Value.Errors(groupDTO, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } else {
    return Err(ErrorTypes.ResourceCreationError);
  }
};
