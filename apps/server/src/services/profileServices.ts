import { profiles, users } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, getColumns } from 'drizzle-orm';
import { ErrorTypes, profileDTO, type CreateProfileBody, type ProfileDTO } from "@baza/shared-types";
import { Value } from "typebox/value";
import { Err, Ok, type Result } from "../lib/types";
import { app } from "../setup";

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
    const converted = Value.Convert(profileDTO, profile)
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
      const converted = Value.Convert(profileDTO, newProfile);
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