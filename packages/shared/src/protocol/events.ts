import Type from "typebox";

// ####### DTO #######

export const personalEventDTO = Type.Object({
  id: Type.String({description: "event ID (randomly given)", example: "1y9889192bfb987"}),
  username: Type.String({description: "username of user who this event belongs to", example: "random_user123"}),
  title: Type.String({description: "title of the event"}),
  description: Type.Union([ Type.String({description: "small description of the event"}), Type.Null() ]),
  date: Type.String({description: "The date of the event ",format: "date"}),
  location: Type.Union([ Type.String({description: "location where the event is going to take place", example: "My house"}), Type.Null() ]),
  startTime: Type.String({format: "date-time", description: "start time of the event"}),
  endTime: Type.String({format: "date-time", description: "end time of the event"}),
  repeat: Type.String({description: "frequency which an event should be repeated in the calendar. Can only be on of these: day, week, month, year, never"}),
  public: Type.Boolean({description: "expresses if an event should be public to the user's friends"}),
  createdAt: Type.String({
      description: "The date and time when the event was created",
      format: "date-time"
  }),
  updatedAt: Type.String({
      description: "The date and time when the event was last updated",
      format: "date-time"
  }),
}, {
  description: "Personal event data.",
  title: "PersonalEventDTO",
});

export type PersonalEventDTO = Type.Static<typeof personalEventDTO>; 

// ####### Route Specific Schemas #######

//GET /users/:id/events?startDate&endDate

//Parameters
export const GetPersonalEventsParams = Type.Object({
  startDate: Type.String({
    description: "Starting from this date, the user events will be returned.",
    format: "date",
  }),
  endDate: Type.String({
    description: "Until this date, the user events will be returned.",
    format: "date",
  }),
})
export type GetPersonalEventsParams = Type.Static<typeof GetPersonalEventsParams>