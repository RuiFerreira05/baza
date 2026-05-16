import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserByUsername, createUserProfile } from "../services/profileServices";
import { ErrorTypes, type CreateProfileBody, type ProfileDTO, type SimpleIdParam, type UsernameParam } from "@baza/shared-types";
import { app } from "../setup";

export const getUserByUsernameHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Recieved get user profile by username request");
  const { username } = req.params as UsernameParam;

  app.log.info(`Fetching profile from user with username: ${username}`)
  const data = await getUserByUsername(username)

  if(!data.ok){
    switch(data.error){
      case ErrorTypes.UnknownUsernameError:
        app.log.warn(`User's profile not found`);
        return res.status(404).send({
          type: ErrorTypes.UnknownUsernameError,
          message: `The profile from a user with the username provided was not found`,
        });
      
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert profile`);
        return res.status(500).send({
          type: ErrorTypes.ConversionError,
          message: `An error occurred while converting the profile data`,
        });
    }
  }
  else{
    return res.send(data.value);
  }
}

export const createUserProfileHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received create user profile request")
  const body = req.body as CreateProfileBody;
  const result = await createUserProfile(body)

  if(!result.ok){
    switch(result.error){
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert created profile`);
        return res.status(500).send({
          type: ErrorTypes.ConversionError,
          message: `An error occurred while converting the created profile data`,
        });
      case ErrorTypes.ResourceCreationError:
        app.log.error(`Failed to create profile`);
        return res.status(500).send({
          type: ErrorTypes.ResourceCreationError,
          message: `An error occurred while creating the profile`,
        });
      case ErrorTypes.UnknownIdError:
        app.log.warn(`User not found`);
        return res.status(404).send({
          type: ErrorTypes.UnknownIdError,
          message: `A user with the provided id was not found`,
        });
    }
  }
  else{
    return res.send(result.value);
  }
}