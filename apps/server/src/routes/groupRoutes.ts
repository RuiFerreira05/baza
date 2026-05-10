import {
  createGroupBody,
  editGroupPhotoParams,
  ErrorTypes,
  genericError,
  getGroupByIdParams,
  groupDTO,
} from "@baza/shared-types";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import {
  createGroupHandler,
  editGroupPhotoHandler,
  getGroupByIdHandler,
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
        params: getGroupByIdParams,
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
        body: createGroupBody,
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
        params: editGroupPhotoParams,
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
};
