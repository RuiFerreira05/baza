import { createGroupBody, ErrorTypes, getGroupByIdParams, groupDTO } from "@baza/shared-types";
import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { createGroupHandler, getGroupByIdHandler } from "../handlers/groupHandlers";

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
          404: Type.Object(
            {
              type: Type.Literal(ErrorTypes.UnknownIdError),
              message: Type.String({
                description: "A human readable error message",
              }),
            },
            {
              description: "if no group with the provided id was found",
            },
          ),
          500: Type.Object(
            {
              type: Type.Literal(ErrorTypes.ConversionError),
              message: Type.String({
                description: "A human readable error message",
              }),
            },
            {
              description:
                "if the group was found but there was an error converting it to the expected format",
            },
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
          500: Type.Object(
            {
              type: Type.Union([
                Type.Literal(ErrorTypes.ConversionError),
                Type.Literal(ErrorTypes.ResourceCreationError),
              ]),
              message: Type.String({
                description: "A human readable error message",
              }),
            },
            {
              description: "if there was an error creating the group or converting the created group to the expected format",
            }
          ),
        },
        body: createGroupBody,
      },
    },
    createGroupHandler,
  );
};
