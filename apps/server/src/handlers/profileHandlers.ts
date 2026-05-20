import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserByUsername, createUserProfile, deleteUserProfile } from "../services/profileServices";
import { createStatusError, createStatusOK, ErrorTypes, type CreateProfileBody, type ProfileDTO, type SimpleIdParam, type SimpleUsernameParam } from "@baza/shared-types";
import { app } from "../setup";

// GET /users/:username
export const getUserByUsernameHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Recieved get user's profile by username request");
  const { username } = req.params as SimpleUsernameParam;

  app.log.info(`Fetching profile from user with username: ${username}`)
  const data = await getUserByUsername(username)

  if(!data.ok){
    switch(data.error){
      case ErrorTypes.UnknownUsernameError:
        app.log.warn(`User's profile not found`);
        return res.status(404).send(
          createStatusError( 
            ErrorTypes.UnknownUsernameError,
            `The profile from a user with the username provided was not found`,
        ));
      
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert profile`);
        return res.status(500).send( createStatusError(
          ErrorTypes.ConversionError,
          `An error occurred while converting the profile data`,
        ));
    }
  }
  else{
    return res.send(createStatusOK(data.value));
  }
}

// POST /users/create
export const createUserProfileHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received create user's profile request")
  const body = req.body as CreateProfileBody;
  const result = await createUserProfile(body)

  if(!result.ok){
    switch(result.error){
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert created profile`);
        return res.status(500).send(createStatusError(
          ErrorTypes.ConversionError,
          `An error occurred while converting the created profile data`,
        ));
      case ErrorTypes.ResourceCreationError:
        app.log.error(`Failed to create profile`);
        return res.status(500).send(createStatusError(
          ErrorTypes.ResourceCreationError,
          `An error occurred while creating the profile`,
        ));
      case ErrorTypes.UnknownIdError:
        app.log.warn(`User not found`);
        return res.status(404).send(createStatusError(
          ErrorTypes.UnknownIdError,
          `A user with the provided id was not found`,
        ));
    }
  }
  else{
    return res.send(createStatusOK(result.value));
  }
}

// POST /users/:username/delete
export const deleteUserProfileHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received delete user's profile request");
  const { username } = req.params as SimpleUsernameParam;
  const result = await deleteUserProfile(username);

  if(!result.ok){
    switch(result.error){
      case ErrorTypes.UnknownUsernameError:
        app.log.error(`User not found`);
        return res.status(404).send(createStatusError(
          ErrorTypes.UnknownUsernameError,
          "A user with the provided username was not found",
        ));
      case ErrorTypes.DeleteError:
        app.log.error(`Failed to delete users's profile with username ${username} `);
        return res.status(500).send(createStatusError(
          ErrorTypes.DeleteError,
          "An error occurred while deleting the profile",
        ));
    }
  }
  else{
    return res.send(createStatusOK(result.value));
  }
}