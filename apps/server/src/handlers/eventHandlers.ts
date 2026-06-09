import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserEvents } from "../services/eventServices";
import { app } from "../setup";
import { type SimpleUsernameParam, type GetPersonalEventsParams, ErrorTypes, createStatusError, createStatusOK } from "@baza/shared-types";

// GET /users/:username/events?startDate,endDate
export const getPersonalEventsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Recieved get user's personal events by username request");
  const { username } = req.params as SimpleUsernameParam;
  const { startDate, endDate } = req.query as GetPersonalEventsParams;
  
  const result = await getUserEvents(username, startDate, endDate);

  if(!result.ok){
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        app.log.warn(`User not found`);
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "A user with the provided username was not found",
          ),
        );
      
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert events' data`);
        return res.status(500).send(
          createStatusError(
            ErrorTypes.ConversionError,
            "An error occurred while converting the events' data"
          )
        )
    }
  }
  else{
    return res.status(200).send(createStatusOK(result.value))
  }
}