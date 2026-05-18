import { profiles, users } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, getColumns } from 'drizzle-orm';
import { ErrorTypes, profileDTO, type CreateProfileBody, type ProfileDTO } from "@baza/shared-types";
import { Value } from "typebox/value";
import { Err, Ok, type Result } from "../lib/types";
import { app } from "../setup";

/**
 * This method fetches the profile data of a specific user from the database by their username, 
 * converts it to a profileDTO, and returns it. If no user with the provided username is found, 
 * it returns an UnknownUsernameError. If there is an error converting the profile data to the 
 * expected format, it returns a ConversionError.
 * 
 * @param username user's name in the app
 * @returns a promised result with a profileDTO, or an error
 */
export const getUserByUsername = async (username: string):
 Promise<Result<ProfileDTO, ErrorTypes.ConversionError | ErrorTypes.UnknownUsernameError>> => {
  
  const profile = await db.query.profiles.findFirst({
    columns: {
      settings: false,
    },
    where: {
      username: username,
    },
  });

  if(profile){

    const sanitizedProfile = {
        ...profile,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
    }

    const converted = Value.Convert(profileDTO, sanitizedProfile)
    if(Value.Check(profileDTO, converted)){
      return Ok(converted);
    }
    else{
      app.log.error(Value.Errors(profileDTO, converted));
      return Err(ErrorTypes.ConversionError);
    }
  }
  else{
    return Err(ErrorTypes.UnknownUsernameError);
  }
}

/**
 * This method creates a new profile for an existing user in the database with the provided username and id.
 * It then converts the created profile to a profileDTO and returns it. If there is an error creating the profile,
 * it returns a ResourceCreationError. If there is an error converting the profile data to the
 * expected format, it returns a ConversionError.
 * 
 * @param userProfile schema with username and id of user
 * @returns a promised result with the created profileDTO, or an error
 */
export const createUserProfile = async (userProfile: CreateProfileBody): 
Promise<Result<ProfileDTO, ErrorTypes.ConversionError | ErrorTypes.ResourceCreationError | ErrorTypes.UnknownIdError>> => {

  //Verify if the user whose profile is being created, exists.
  const user = await db.select().from(users).where(eq(users.id, userProfile.userId));

  if(user.length == 1){
    const newProfile = await db.insert(profiles).values({
      username: userProfile.username,
      userId: userProfile.userId,
      settings: {},
    }).returning();

    if(newProfile){

      const sanitizedProfile = {
        ...newProfile[0],
        createdAt: newProfile[0]?.createdAt.toISOString(),
        updatedAt: newProfile[0]?.updatedAt.toISOString(),
      }

      const converted = Value.Convert(profileDTO, sanitizedProfile);
      if(Value.Check(profileDTO, converted)){
        return Ok(converted);
      }
      else{
        app.log.error(Value.Errors(profileDTO, converted));
        return Err(ErrorTypes.ConversionError);
      }
    }
    else{
      return Err(ErrorTypes.ResourceCreationError);
    }
  }
  else{
    return Err(ErrorTypes.UnknownIdError);
  }
}