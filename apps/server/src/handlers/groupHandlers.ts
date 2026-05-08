import { ErrorTypes, type getGroupByIdParams } from "@baza/shared-types";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getGroupById } from "../services/groupServices";
import { app } from "../setup";

// /groups/:id
export const getGroupByIdHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get group by id request");
  const { id } = req.params as getGroupByIdParams;
  app.log.info(`Fetching group with id: ${id}`);

  const group = await getGroupById(id);

  if (!group.ok) {
    switch (group.error) {
      case ErrorTypes.UnknownIdError:
        app.log.warn(`Group not found`);
        return res.status(404).send(`Group not found`); // TODO: specific error return schemas

      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert group`);
        return res.status(500).send(`Failed to convert group`); // TODO: specific error return schemas
    }
  }

  return res.send(group.value);
};
