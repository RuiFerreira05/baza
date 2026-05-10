import { createGroupBody, editGroupPhotoParams, ErrorTypes, type getGroupByIdParams } from "@baza/shared-types";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createGroup, getGroupById, saveGroupPhoto } from "../services/groupServices";
import { app } from "../setup";

// /groups/:id
export const getGroupByIdHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get group by id request");
  const { id } = req.params as getGroupByIdParams;
  app.log.info(`Fetching group with id: ${id}`);

  const group = await getGroupById(id);

  if (!group.ok) {
    switch (group.error) {
      case ErrorTypes.UnknownIdError:
        app.log.warn(`Group not found`);
        return res.status(404).send({
          type: ErrorTypes.UnknownIdError,
          message: `A group with the provided id was not found`,
        });

      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert group`);
        return res.status(500).send({
          type: ErrorTypes.ConversionError,
          message: `An error occurred while converting the group data`,
        });
    }
  } else {
    return res.send(group.value);
  }
};

export const createGroupHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Create Group request")
  const { groupName } = req.body as createGroupBody;
  const result = await createGroup(groupName);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert created group`);
        return res.status(500).send({
          type: ErrorTypes.ConversionError,
          message: `An error occurred while converting the created group data`,
        });
      case ErrorTypes.ResourceCreationError:
        app.log.error(`Failed to create group`);
        return res.status(500).send({
          type: ErrorTypes.ResourceCreationError,
          message: `An error occurred while creating the group`,
        });
    }
  } else {
    return res.send(result.value);
  }
}

export const editGroupPhotoHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Edit Group Photo request");
  const { id } = req.params as editGroupPhotoParams;
  const photo = await req.file();

  if (!photo) {
    return res.status(400).send({
      type: ErrorTypes.MalformedRequestError,
      message: "No photo file uploaded",
    });
  }

  const group = await saveGroupPhoto(id, photo);

  if (!group.ok) {
    switch (group.error) {
      case ErrorTypes.UnknownIdError:
        app.log.warn(`Group not found`);
        return res.status(404).send({
          type: ErrorTypes.UnknownIdError,
          message: `A group with the provided id was not found`,
        });
      case ErrorTypes.ResourceCreationError:
        app.log.error(`Failed to save group photo or update group with new photo`);
        return res.status(500).send({
          type: ErrorTypes.ResourceCreationError,
          message: `An error occurred while saving the group photo or updating the group with the new photo`,
        });
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert updated group data`);
        return res.status(500).send({
          type: ErrorTypes.ConversionError,
          message: `An error occurred while converting the updated group data`,
        });
    }
  } else {
    return res.status(201).send(group.value);
  }
}