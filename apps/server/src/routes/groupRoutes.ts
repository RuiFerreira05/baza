import { getGroupByIdParams, groupDTO } from "@baza/shared-types";
import { Type, type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { getGroupByIdHandler } from "../handlers/groupHandlers";

export const groupRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get(
    "/:id",
    {
      schema: {
        description: "This route fetches information from a group",
        tags: ["groups"],
        response: {
          200: groupDTO,
          404: Type.String({
            description: "if no group with the provided id was found",
          }),
          500: Type.String({
            description: "if an error occurred while fetching the group",
          }),
        },
        params: getGroupByIdParams,
      },
    },
    getGroupByIdHandler,
  );
};
