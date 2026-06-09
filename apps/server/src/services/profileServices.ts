import { profiles, users } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq } from 'drizzle-orm';
import { ErrorTypes, profileDTO, type CreateProfileBody, type PersonalEventDTO, type ProfileDTO } from "@baza/shared-types";
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
    const [newProfile] = await db.insert(profiles).values({
      username: userProfile.username,
      userId: userProfile.userId,
      settings: {},
    }).returning();

    if(newProfile){

      const sanitizedProfile = {
        ...newProfile,
        createdAt: newProfile?.createdAt.toISOString(),
        updatedAt: newProfile?.updatedAt.toISOString(),
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

/**
 * This method deletes a user's profile from the database by the provided username.
 * If the profile is successfully deleted, it returns the deleted profile as a profileDTO.
 * If the profile is not found, it returns an UnknownUsernameError. If there is an error during
 * the deletion process or conversion, it returns a DeleteError.
 * 
 * @param username the username of the user whose profile is being deleted
 * @returns a promised result with the deleted profileDTO, or an error
 */
export const deleteUserProfile = async (username: string):
Promise<Result<ProfileDTO, ErrorTypes.DeleteError | ErrorTypes.UnknownUsernameError>> => {
 
  try{
      const deletedProfile = await db.transaction(async (tx) => {
      const [profile] = await tx.delete(profiles).where(eq(profiles.username, username)).returning();
        
      if(!profile){
        app.log.warn(`Profile from user with username ${username} not found`);
        tx.rollback();
      }

      const sanitizedProfile = {
        ...profile,
        createdAt: profile?.createdAt.toISOString(),
        updatedAt: profile?.updatedAt.toISOString(),
      }

      const converted = Value.Convert(profileDTO, sanitizedProfile);
      if(Value.Check(profileDTO, converted)){
        return converted;
      }
      else{
        app.log.error(Value.Errors(profileDTO, converted));
        tx.rollback();
      }
    });

    if(deletedProfile){
      return Ok(deletedProfile)
    }
    else{
      return Err(ErrorTypes.UnknownUsernameError);
    }
  } catch (error){
    app.log.error(`Failed to delete profile from user with username ${username}: ${(error as Error).message}`);
    return Err(ErrorTypes.DeleteError);
  }
}

/**
 * This method updates the username and/or description of an existing user profile. If successful, it
 * returns the updated profile as a profileDTO. If no user with the provided username is found, it
 * returns an UnknownUsernameError. If there is an error converting the profile data to the
 * expected format, it returns a ConversionError.
 * 
 * @param username username of the user whose profile is being edited
 * @param newUserName new username of the user whose profile is being edited
 * @param description new description of the profile that is being edited
 * @returns a promised result with the updated profileDTO, or an error
 */
export const editUserProfile = async ( username: string, newUserName: string | undefined, description: string | undefined):
Promise<Result<ProfileDTO, ErrorTypes.UnknownUsernameError | ErrorTypes.ConversionError | ErrorTypes.ExistingResourceError>> => {
  
  const usernameCheck = await db.query.profiles.findFirst({
    where: {
      username: newUserName,
    },
  })

  if(!usernameCheck){
    const [profile] = await db.update(profiles).set({
      username: newUserName,
      description: description,
      updatedAt: new Date(),
    }).where(eq(profiles.username, username)).returning();

    if(profile){
      const sanitizedProfile = {
          ...profile,
          createdAt: profile?.createdAt.toISOString(),
          updatedAt: profile?.updatedAt.toISOString(),
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
      app.log.warn(`User with id ${username} not found`);
      return Err(ErrorTypes.UnknownUsernameError);
    }
  }
  else{
    app.log.warn(`User with name ${newUserName} already exists`);
    return Err(ErrorTypes.ExistingResourceError);
  }
}