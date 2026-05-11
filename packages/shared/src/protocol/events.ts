import Type from "typebox";
import { SafeDate } from "./users";

// ####### DTO #######

export const personalEventPublicSchema = Type.Object({
  id: Type.String({description: "event ID (randomly given)", example: "1y9889192bfb987"}),
  username: Type.String({description: "username of user who this event belongs to", example: "random_user123"}),
  date: SafeDate(),
  location: Type.Union([ Type.String({description: "location where the event is going to take place", example: "My house"}), Type.Null() ]),
  startTime: Type.String({format: "time", description: "start time of the event"}),
  endTime: Type.String({format: "time", description: "end time of the event"}),
  repeat: Type.String({description: "frequency which an event should be repeated in the calendar. Can only be on of these: day, week, month, year, never"}),
  public: Type.Boolean({description: "expresses if an event should be public to the user's friends"}),
}, {
  description: "Personal event data.",
  title: "PersonalEventDTO",
});

export type PersonalEventDTO = Type.Static<typeof personalEventPublicSchema>; 

// ####### Route Specific Schemas #######

// GET /users/:id/events?startDate&endDate
export const getPersonalEventsResponseSchema = Type.Array(personalEventPublicSchema, {
  description: "Response schema for GET /users/:id/events?startDate&endDate, an array of event objects.",
  title: "GetPersonalEventResponse",
});
export type GetPersonalEventsResponse = Type.Static<typeof getPersonalEventsResponseSchema>;