import {
  CreateGroupBody,
  EditGroupBody,
  ErrorTypes,
  groupDTO,
  groupMemberDTO,
  SimpleIdParam,
  SimpleUsernameParam,
  StatusError,
  StatusOK,
} from "@baza/shared-types";
import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  createGroupHandler,
  deleteGroupHandler,
  editGroupHandler,
  editGroupPhotoHandler,
  getGroupByIdHandler,
  getGroupMembersHandler,
  getGroupPhotoHandler,
  inviteUsersToGroupHandler,
  removeUserFromGroupHandler,
} from "../handlers/groupHandlers";

export const groupRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // GET /groupds/:id
  app.get(
    "/:id",
    {
      schema: {
        description: "This route fetches information from a group",
        tags: ["groups"],
        response: {
          200: StatusOK(
            groupDTO,
            "if the group information was successfully fetched and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the group data to the expected format before sending the response",
          ),
        },
        params: SimpleIdParam("The UUID of the group being fetched"),
      },
    },
    getGroupByIdHandler,
  );

  // POST /groups/create
  app.post(
    "/create",
    {
      schema: {
        description: "This route creates a new group",
        tags: ["groups"],
        response: {
          200: StatusOK(
            groupDTO,
            "if the group was successfully created and converted to the expected format before sending the response",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if the group was created but there was an error converting it to the expected format before sending the response",
          ),
        },
        body: CreateGroupBody,
      },
    },
    createGroupHandler,
  );

  // DELETE /groups/:id/delete
  app.delete(
    "/:id/delete",
    {
      schema: {
        description: "This route deletes a group",
        tags: ["groups"],
        params: SimpleIdParam("The UUID of the group being deleted"),
        response: {
          200: StatusOK(
            groupDTO,
            "if the group was successfully deleted",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.DeleteError,
            "if there was an error deleting the group",
          ),
        },
      },
    },
    deleteGroupHandler,
  )

  // PATCH /groups/:id/edit/photo
  app.patch(
    "/:id/edit/photo",
    {
      schema: {
        description: "This route allows editing a group's photo",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose photo is being edited",
        ),
        response: {
          201: StatusOK(
            groupDTO,
            "if the group photo was successfully updated and the updated group data was successfully converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ResourceCreationError,
            "if there was an error saving the group photo or updating the group with the new photo",
          ),
        },
      },
    },
    editGroupPhotoHandler,
  );

  // GET /groups/:id/photo
  app.get(
    "/:id/photo",
    {
      schema: {
        description: "This route fetches a group's photo",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose photo is being fetched",
        ),
        response: {
          200: Type.String({
            description: "The group photo as a stream",
          }),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found or if the group does not have a photo",
          ),
          500: StatusError(
            ErrorTypes.ResourceCreationError,
            "if there was an error fetching the group photo",
          ),
        },
      },
    },
    getGroupPhotoHandler,
  );

  // PATCH /groups/:id/edit
  app.patch(
    "/:id/edit",
    {
      schema: {
        description:
          "This route allows editing a group's information (except photo)",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose information is being edited",
        ),
        body: EditGroupBody,
        response: {
          200: StatusOK(
            groupDTO,
            "if the group information was successfully updated and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the updated group data to the expected format before sending the response",
          ),
        },
      },
    },
    editGroupHandler,
  );

  // ###### GROUP MEMBERS #######

  // POST /groups/:id/group-members/invite-user
  app.post(
    "/:id/group-members/invite-user",
    {
      schema: {
        description: "This route allows inviting users to a group",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group to which users are being invited",
        ),
        body: SimpleUsernameParam(
          "The username of the user being invited to the group",
        ),
        response: {
          201: StatusOK(
            groupMemberDTO,
            "Indicates that the users were successfully invited to the group",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group or user with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ResourceCreationError,
            "if there was an error creating the group invitation",
          ),
        },
      },
    },
    inviteUsersToGroupHandler,
  );

  // POST /groups/:id/group-members/remove-user
  app.post(
    "/:id/group-members/remove-user",
    {
      schema: {
        description: "This route allows removing users from a group",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group from which users are being removed",
        ),
        body: SimpleUsernameParam(
          "The username of the user being removed from the group",
        ),
        response: {
          200: StatusOK(
            groupMemberDTO,
            "Indicates that the user was successfully removed from the group and the updated group member data was successfully converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group or user with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error removing the user from the group",
          ),
        },
      },
    },
    removeUserFromGroupHandler,
  )

  // GET /groups/:id/group-members
  app.get(
    "/:id/group-members",
    {
      schema: {
        description:
          "This route fetches all members of a group (including members who have been banned or have not accepted their invite yet)",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose members are being fetched",
        ),
        response: {
          200: StatusOK(
            Type.Array(groupMemberDTO),
            "if the group members were successfully fetched and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the group members data to the expected format before sending the response",
          ),
        },
      },
    },
    getGroupMembersHandler,
  );
};
