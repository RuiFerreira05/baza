import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserById, createUserProfile } from "../services/userServices";
import type { UserProfileDTO } from "@baza/shared-types";

export const getPersonalEventsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const { id } = req.params as { id: string };
  const data = await getUserById(id)

  if(data.length > 0){
    return res.code(200).send(data[0]);
  }
  else{
    return res.code(404).send("Personal events of user were not found.")
  }
}