import { db } from "../lib/db";
import { ErrorTypes, personalEventDTO,type PersonalEventDTO } from "@baza/shared-types";
import { Value } from "typebox/value";
import { Err, Ok, type Result } from "../lib/types";
import { app } from "../setup";
import Type from "typebox";

/**
 * This method fetches the personal events, between the two given dates, of a user 
 * with the provided username. It converts the events to an array of personalEventDTOs 
 * and returns them. If the user is not found, it returns an UnknownUsernameError. If 
 * there is an error converting the events' data, it returns a ConversionError. 
 * 
 * @param username username of the user 
 * @param startDate date where the event fecthing starts
 * @param endDate date where the event fecthing ends
 * @returns a promised result with an array of personalEventDTO, or an error
 */
export const getUserEvents = async( username: string, startDate: string, endDate: string ):
Promise<Result<PersonalEventDTO[], ErrorTypes.ConversionError | ErrorTypes.UnknownUsernameError>> => {

  const personalEvents = await db.query.personalEvents.findMany({
    where: {
      username: username,
      date: {
        gte: startDate,
        lte: endDate,
      }
    },
    with: {
      events: true,
    }
  });

  if(personalEvents){
    const sanitizedEvents = []
    for(const personalEvent of personalEvents){
      const {events, ...rest} = personalEvent;
      
      if(events){

        const sanitizedEvent = {
          ...rest,
          id: events.id,
          title: events.title,
          description: events.description,
          createdAt: events.createdAt.toISOString(),
          updatedAt: events.updatedAt.toISOString(),
          startTime: rest.startTime.toISOString(),
          endTime: rest.endTime.toISOString()
        };

        app.log.info(`DATE: ${rest.date}`)
        app.log.info(`START TIME: ${rest.startTime}`)
        app.log.info(`END TIME: ${rest.endTime}`)
        sanitizedEvents.push(sanitizedEvent);
      }
    }

    const check = Type.Array(personalEventDTO);
    const converted = Value.Convert(check, sanitizedEvents);
    if(Value.Check(check, converted)){
      return Ok(converted);
    }
    else{
      app.log.error(Value.Errors(check, converted));
      return Err(ErrorTypes.ConversionError);
    }
  }
  else{
    app.log.warn(`User with username ${username} not found`);
    return Err(ErrorTypes.UnknownUsernameError);
  }
}