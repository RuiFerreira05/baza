import { getUserProfileResponseSchema, createUserProfileRequestSchema, createUserProfileResponseSchema } from "@baza/shared-types";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { getUserByIdHandler, createUserProfileHandler } from "../handlers/profileHandlers";


export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get(
    "/:id",
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

  app.post(
    "/create",
    {
      schema: {
        description: "This route creates a profile for a user of the app",
        tags: ["users"],
        body: createUserProfileRequestSchema,
        response: {
          201: createUserProfileResponseSchema,
          400: {
            description: "Bad request"
          }
        },
      },
    },
    createUserProfileHandler
  );

  // app.get(
  //   "/:id/events",
     
  // );
}