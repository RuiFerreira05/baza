import { getUserProfileResponseSchema, createUserProfileRequestSchema, createUserProfileResponseSchema, getPersonalEventsResponseSchema } from "@baza/shared-types";
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
              description: "username",
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

  app.get(
    "/:id/events",
    {
      schema: {
        description: "This route fetches all events, in the given time period, from a user calendar.",
        tags: ["users"],
        querystring: {
          startDate: { 
            type: "string",
            description: "Start date of the time period. Following ISO format: yyyy-mm-dd"
          },
          endDate: {
            type: "string",
            description: "End date of the time period. Following ISO format: yyyy-mm-dd"
          }
        },
        response: {
          200: getPersonalEventsResponseSchema,
          404:{
            description: "Resources do not exist."
          }
        },
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "username of user who is the owner of these events",
            },
          },
        },
      },
    },

  );
}