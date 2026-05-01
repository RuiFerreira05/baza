import { getUserProfileResponseSchema } from "@baza/shared-types";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { getUserByIdHandler } from "../handlers/profiles";


export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get(
    "/users/:id",
    {
      schema: {
        description: "This route fetches profile information from a user of the app",
        tags: ["users"],
        response: {
          200: getUserProfileResponseSchema,
          404:{
            description: "Resource does not exist."
          }
        },
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "user id",
            },
          },
        },
      },
    },
    getUserByIdHandler
  );
}