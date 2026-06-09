import Type from "typebox";
import { nullable } from "./general";

// ####### DTO #######

export const personalEventDTO = Type.Object({
  id: Type.String({description: "event ID (randomly given)", example: "1y9889192bfb987"}),
  username: Type.String({description: "username of user who this event belongs to", example: "random_user123"}),
  title: Type.String({description: "event title", example: "Doctor Appointment"}),
  description: nullable(Type.String({description: "event description", example: "Annual checkup"})),
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

export const groupEventDTO = Type.Object({
  id: Type.String({ format: "uuid", description: "Event UUID" }),
  groupId: Type.String({ format: "uuid", description: "Group UUID" }),
  title: Type.String({ description: "Event title" }),
  description: nullable(Type.String({ description: "Event description" })),
  startDate: Type.String({ format: "date", description: "Start date YYYY-MM-DD" }),
  endDate: Type.String({ format: "date", description: "End date YYYY-MM-DD" }),
  state: Type.Union([Type.Literal("finished"), Type.Literal("unfinished"), Type.Literal("needs_tiebreaker")]),
  votingEndTime: nullable(Type.String({ format: "date-time", description: "Voting end time" })),
  createdBy: Type.String({ description: "Creator username" }),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
}, {
  description: "Group event data.",
  title: "GroupEventDTO",
});

export type GroupEventDTO = Type.Static<typeof groupEventDTO>;

export const preferenceDTO = Type.Object({
  groupEventId: Type.String({ format: "uuid" }),
  username: Type.String(),
  preference: Type.Any({ description: "Unstructured JSON preferences" }),
  private: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
}, {
  description: "User preference for a group event.",
  title: "PreferenceDTO",
});

export type PreferenceDTO = Type.Static<typeof preferenceDTO>;

// ####### Route Specific Schemas #######

// POST /groups/:idgroup/events/create
export const CreateEventBody = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 64 }),
  description: Type.Optional(Type.String()),
  startDate: Type.String({ format: "date" }),
  endDate: Type.String({ format: "date" }),
  votingEndTime: Type.String({ format: "date-time" }),
});
export type CreateEventBody = Type.Static<typeof CreateEventBody>;

// PATCH /groups/:idgroup/events/:idevent/edit
export const EditEventBody = Type.Object({
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 64 })),
  description: Type.Optional(Type.String()),
  votingEndTime: Type.Optional(Type.String({ format: "date-time" })),
});
export type EditEventBody = Type.Static<typeof EditEventBody>;

// POST /groups/:idgroup/events/:idevent/preferences/create (and edit)
export const CreatePreferenceBody = Type.Object({
  preference: Type.Any({ description: "Unstructured preferences JSON" }),
  private: Type.Boolean(),
});
export type CreatePreferenceBody = Type.Static<typeof CreatePreferenceBody>;

// GET /groups/:idgroup/events/:idevent/preferences/group
export const groupPreferenceReportDTO = Type.Object({
  totalResponses: Type.Integer(),
  dateAvailability: Type.Record(Type.String(), Type.Integer(), { description: "Occurrences of available dates" }),
  preferredActivities: Type.Record(Type.String(), Type.Integer(), { description: "Occurrences of preferred activities" }),
  budgetRange: Type.Object({
    min: Type.Union([Type.Integer(), Type.Null()]),
    max: Type.Union([Type.Integer(), Type.Null()]),
  }),
}, {
  description: "Aggregated group preferences report.",
  title: "GroupPreferenceReportDTO",
});
export type GroupPreferenceReportDTO = Type.Static<typeof groupPreferenceReportDTO>;

// POST /groups/:idgroup/events/:idevent/resolve-tie
export const ResolveTieBody = Type.Object({
  planId: Type.String({ format: "uuid" }),
});
export type ResolveTieBody = Type.Static<typeof ResolveTieBody>;

// GET /users/:id/events?startDate&endDate
export const GetPersonalEventsResponse = Type.Array(personalEventDTO, {
  description: "Response schema for GET /users/:id/events?startDate&endDate, an array of event objects.",
  title: "GetPersonalEventsResponse",
});
export type GetPersonalEventsResponse = Type.Static<typeof GetPersonalEventsResponse>;

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
});
export type GetPersonalEventsParams = Type.Static<typeof GetPersonalEventsParams>;

// GET /groups/:id/calendar
export const groupCalendarDTO = Type.Object({
  groupEvents: Type.Array(groupEventDTO),
  memberEvents: Type.Array(personalEventDTO),
}, {
  description: "Combined group calendar containing group events and group members' personal events.",
  title: "GroupCalendarDTO",
});
export type GroupCalendarDTO = Type.Static<typeof groupCalendarDTO>;