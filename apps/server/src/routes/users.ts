import { users } from "@baza/db/schemas";
import { getUsersResponseSchema } from "@baza/shared-types";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { db } from "../lib/db";
// import { getUserById } from "../services/userServices";

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.get(
    "/",
    {
      schema: {
        description: "This route fetches all users from the app",
        tags: ["users"],
        response: {
          200: getUsersResponseSchema,
        },
      },
    },
    async (_, res) => {
      const data = await db.select().from(users);
      // data is automatically parsed by the response type that was defined above. This means there
      // is no need to strip the sensitive fields from the user, we only send what is defined in
      // getUsersResponseSchema
      res.code(200).send(data);
    },
  );

  // app.get(
  //   "/:id/",
  //   {
  //     schema: {
  //       description: "This route fetches all users from the app",
  //       tags: ["users"],
  //       response: {
  //         200: getUserByIdResponseSchema,
  //       },
  //     },
  //   },
  //   async (req, res) => {
  //     const { id } = req.params as { id: string };
  //     return getUserById(id);
  //   }
  // );
};
