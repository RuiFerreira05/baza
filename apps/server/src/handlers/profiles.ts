import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserById } from "../services/userServices";

export const getUserByIdHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const { id } = req.params as { id: string };
  const data = await getUserById(id)

  if(data.length > 0){
    return res.code(200).send(data[0]);
  }
  else{
    return res.code(404).send("User with said id was not found.")
  }
}