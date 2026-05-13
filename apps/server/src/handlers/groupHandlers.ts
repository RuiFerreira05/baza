import { CreateGroupBody, EditGroupBody, ErrorTypes, SimpleIdParam } from "@baza/shared-types";
import type { FastifyReply, FastifyRequest } from "fastify";
import { FSUploadService } from "../lib/FSUploadService";
import { createGroup, editGroup, editGroupPhoto, getGroupById } from "../services/groupServices";
import { app, fileUploadService } from "../setup";

// /groups/:id
export const getGroupByIdHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get group by id request");
  const { id } = req.params as SimpleIdParam;
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

// /groups/create
export const createGroupHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Create Group request")
  const { groupName } = req.body as CreateGroupBody;
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

// groups/:id/edit/photo
export const editGroupPhotoHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Edit Group Photo request");
  const { id } = req.params as SimpleIdParam;
  const photo = await req.file();

  if (!photo) {
    return res.status(400).send({
      type: ErrorTypes.MalformedRequestError,
      message: "No photo file uploaded",
    });
  }

  const group = await editGroupPhoto(id, photo);

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

// groups/:id/photo
// This route does not use a service as it's essentially just a wrapper over Fastify's static file serving functionality
export const getGroupPhotoHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Get Group Photo request");
  const { id } = req.params as SimpleIdParam;

  const result = await fileUploadService.getGroupPhoto(id);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        app.log.warn(`Group photo not found`);
        return res.status(404).send({
          type: ErrorTypes.UnknownIdError,
          message: `A group photo with the provided id was not found`,
        });
    }
  } else {
    const photoResult = result.value;
    switch (photoResult.type) {
      case "static":
        app.log.info(`GetGroupPhotoHandler: Sending static file ${photoResult.filename} for group ${id}`);
        return res.sendFile(photoResult.filename, FSUploadService.groupPhotoDir);
      // other cases for different GetImageResult types
    }
  }
}

// groups/:id/edit
export const editGroupHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const { id } = req.params as SimpleIdParam;
  const { groupName, description } = req.body as EditGroupBody;

  const result = await editGroup(id, groupName, description);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        app.log.warn(`Group not found`);
        return res.status(404).send({
          type: ErrorTypes.UnknownIdError,
          message: `A group with the provided id was not found`,
        });
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert updated group data`);
        return res.status(500).send({
          type: ErrorTypes.ConversionError,
          message: `An error occurred while converting the updated group data`,
        });
      case ErrorTypes.ExistingResourceError:
        app.log.warn(`Group with name ${groupName} already exists`);
        return res.status(400).send({
          type: ErrorTypes.ExistingResourceError,
          message: `A group with the provided name already exists`,
        });
    }
  } else {
    return res.send(result.value);
  }
}
