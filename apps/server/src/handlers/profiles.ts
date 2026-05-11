import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserById, createUserProfile } from "../services/userServices";
import type { UserProfileDTO } from "@baza/shared-types";

export const getUserByIdHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const { id } = req.params as { id: string };
  const data = await getUserById(id)

  if(data.length > 0){
    return res.code(200).send(data[0]);
  }
  else{
    return res.code(404).send("User with said username was not found.")
  }
}

export const createUserProfileHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const { body } = req as {body: UserProfileDTO};
  console.log(body);
  const result = await createUserProfile(body)
  console.log(`RESULT ${result}`);

  if(result != null){
    if(result.length > 0){
      return res.code(201).send(result);
    }
    else{
      return res.code(400).send("Couldn't create new profile.");
    }
  }
  return res.code(400).send("Couldn't create new profile.");
}