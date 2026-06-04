import {
  CreateGroupBody,
  EditGroupBody,
  ErrorTypes,
  SimpleIdParam,
  SimpleUsernameParam,
  createStatusError,
  createStatusOK,
} from "@baza/shared-types";
import type { FastifyReply, FastifyRequest } from "fastify";
import { FSUploadService } from "../lib/FSUploadService";
import {
  createGroup,
  deleteGroup,
  editGroup,
  editGroupPhoto,
  getGroupById,
  getGroupMembers,
  inviteUserToGroup,
  removeUserFromGroup,
  promoteUserToAdmin,
  dismissUserAsAdmin,
} from "../services/groupServices";
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
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group with the provided id was not found",
            ),
          );

      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert group`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the group data",
            ),
          );
    }
  } else {
    return res.send(createStatusOK(group.value));
  }
};

// GET /groups/create
export const createGroupHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Create Group request");
  const { groupName } = req.body as CreateGroupBody;
  const result = await createGroup(groupName);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert created group`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the created group data",
            ),
          );
      case ErrorTypes.ResourceCreationError:
        app.log.error(`Failed to create group`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ResourceCreationError,
              "An error occurred while creating the group",
            ),
          );
    }
  } else {
    return res.send(createStatusOK(result.value));
  }
};

// DELETE groups/:id/delete
export const deleteGroupHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Delete Group request");
  const { id } = req.params as SimpleIdParam;
  const result = await deleteGroup(id);
  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        app.log.warn(`Group not found`);
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group with the provided id was not found",
            ),
          );
      case ErrorTypes.DeleteError:
        app.log.error(`Failed to delete group with id ${id}`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.DeleteError,
              "An error occurred while deleting the group",
            ),
          );
    }
  } else {
    return res.send(createStatusOK(result.value));
  }
};

// PATCH groups/:id/edit/photo
export const editGroupPhotoHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Edit Group Photo request");
  const { id } = req.params as SimpleIdParam;
  const photo = await req.file();

  if (!photo) {
    return res
      .status(400)
      .send(
        createStatusError(
          ErrorTypes.MalformedRequestError,
          "No photo file was provided in the request",
        ),
      );
  }

  const group = await editGroupPhoto(id, photo);

  if (!group.ok) {
    switch (group.error) {
      case ErrorTypes.UnknownIdError:
        app.log.warn(`Group not found`);
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group with the provided id was not found",
            ),
          );
      case ErrorTypes.ResourceCreationError:
        app.log.error(
          `Failed to save group photo or update group with new photo`,
        );
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ResourceCreationError,
              "An error occurred while saving the group photo or updating the group with the new photo",
            ),
          );
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert updated group data`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the updated group data",
            ),
          );
    }
  } else {
    return res.status(201).send(createStatusOK(group.value));
  }
};

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
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group photo for a group with the provided id was not found",
            ),
          );
    }
  } else {
    const photoResult = result.value;
    switch (photoResult.type) {
      case "static":
        app.log.info(
          `GetGroupPhotoHandler: Sending static file ${photoResult.filename} for group ${id}`,
        );
        return res.sendFile(
          photoResult.filename,
          FSUploadService.groupPhotoDir,
        );
      // other cases for different GetImageResult types
    }
  }
};

// PATCH groups/:id/edit
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
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group with the provided id was not found",
            ),
          );
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert updated group data`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the updated group data",
            ),
          );
      case ErrorTypes.ExistingResourceError:
        app.log.warn(`Group with name ${groupName} already exists`);
        return res
          .status(400)
          .send(
            createStatusError(
              ErrorTypes.ExistingResourceError,
              `A group with the name ${groupName} already exists`,
            ),
          );
    }
  } else {
    return res.send(createStatusOK(result.value));
  }
};

// ####### GROUP MEMBERS ########

// POST /groups/:id/group-members/invite-user
export const inviteUsersToGroupHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const { id: groupId } = req.params as SimpleIdParam;
  const { username } = req.body as SimpleUsernameParam;

  const result = await inviteUserToGroup(groupId, username);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group or user with the provided id was not found",
            ),
          );
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert group invitation data`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the group invitation data",
            ),
          );
      case ErrorTypes.ResourceCreationError:
        app.log.error(`Failed to create group invitation`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ResourceCreationError,
              "An error occurred while creating the group invitation",
            ),
          );
    }
  } else {
    return res.status(201).send(createStatusOK(result.value));
  }
};

// GET /groups/:id/group-members/
export const getGroupMembersHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const { id: groupId } = req.params as SimpleIdParam;

  const result = await getGroupMembers(groupId);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group with the provided id was not found",
            ),
          );
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert group members data`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the group members data",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /groups/:id/group-members/remove-user
export const removeUserFromGroupHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const { id: groupId } = req.params as SimpleIdParam;
  const { username } = req.body as SimpleUsernameParam;

  const result = await removeUserFromGroup(groupId, username);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group or user with the provided id was not found",
            ),
          );
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert group member removal result data`);
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the group member removal result data",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// PATCH /groups/:id/group-members/:username/promote-to-admin
export const promoteUserToAdminHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const { id: groupId } = req.params as SimpleIdParam;
  const { username } = req.params as { username: string };

  const result = await promoteUserToAdmin(groupId, username);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group or user with the provided id/username was not found",
            ),
          );
      case ErrorTypes.ConversionError:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the promoted admin data",
            ),
          );
      case ErrorTypes.UpdateError:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.UpdateError,
              "An error occurred while promoting the user to admin",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// PATCH /groups/:id/group-members/:username/dismiss-admin
export const dismissUserAsAdminHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const { id: groupId } = req.params as SimpleIdParam;
  const { username } = req.params as { username: string };

  const result = await dismissUserAsAdmin(groupId, username);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "A group or user with the provided id/username was not found",
            ),
          );
      case ErrorTypes.ConversionError:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the dismissed admin data",
            ),
          );
      case ErrorTypes.UpdateError:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.UpdateError,
              "An error occurred while dismissing the user as admin",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};
