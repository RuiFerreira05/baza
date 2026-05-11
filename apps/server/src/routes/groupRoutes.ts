import {
  CreateGroupBody,
  EditGroupBody,
  ErrorTypes,
  genericError,
  groupDTO,
  SimpleIdParam,
} from "@baza/shared-types";
import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  createGroupHandler,
  editGroupHandler,
  editGroupPhotoHandler,
  getGroupByIdHandler,
  getGroupPhotoHandler,
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
          200: groupDTO,
          404: genericError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: genericError(
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
          200: groupDTO,
          500: genericError(
            ErrorTypes.ConversionError,
            "if the group was created but there was an error converting it to the expected format before sending the response",
          ),
        },
        body: CreateGroupBody,
      },
    },
    createGroupHandler,
  );

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
          201: groupDTO,
          404: genericError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: genericError(
            ErrorTypes.ResourceCreationError,
            "if there was an error saving the group photo or updating the group with the new photo",
          ),
        },
      },
    },
    editGroupPhotoHandler,
  );

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
          404: genericError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found or if the group does not have a photo",
          ),
          500: genericError(
            ErrorTypes.ResourceCreationError,
            "if there was an error fetching the group photo",
          ),
        }
      },
    },
    getGroupPhotoHandler,
  );

  app.patch(
    "/:id/edit",
    {
      schema: {
        description: "This route allows editing a group's information (except photo)",
        tags: ["groups"],
        params: SimpleIdParam(
          "The UUID of the group whose information is being edited",
        ),
        body: EditGroupBody,
        response: {
          200: groupDTO,
          404: genericError(
            ErrorTypes.UnknownIdError,
            "if no group with the provided id was found",
          ),
          500: genericError(
            ErrorTypes.ConversionError,
            "if there was an error converting the updated group data to the expected format before sending the response",
          ),
        }
      }
    },
    editGroupHandler
  )
};
