import { Type } from "typebox";
import { nullable } from "./general";

// ####### DTO #######
export const planDTO = Type.Object({
  id: Type.String({ format: "uuid", description: "Plan UUID" }),
  groupEventId: Type.String({ format: "uuid", description: "Parent group event UUID" }),
  username: Type.String({ description: "Username of the plan proposer" }),
  title: Type.String({ description: "Title of the proposed plan" }),
  date: Type.String({ format: "date", description: "Proposed date (YYYY-MM-DD)" }),
  startTime: Type.String({ format: "time", description: "Proposed start time" }),
  endTime: Type.String({ format: "time", description: "Proposed end time" }),
  allDay: Type.Boolean({ description: "Expresses if this plan is an all day event" }),
  activity: nullable(Type.String({ description: "Proposed activity detail" })),
  location: Type.String({ description: "Proposed location" }),
  minBudget: nullable(Type.Integer({ description: "Minimum budget estimation" })),
  maxBudget: nullable(Type.Integer({ description: "Maximum budget estimation" })),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  votesCount: Type.Optional(Type.Integer({ description: "Total votes casted for this plan" })),
  hasVoted: Type.Optional(Type.Boolean({ description: "Expresses if the requesting user voted for this plan" })),
}, {
  description: "Group proposed plan data.",
  title: "PlanDTO",
});

export type PlanDTO = Type.Static<typeof planDTO>;

// ####### Route Specific Schemas #######

// POST /groups/:idgroup/events/:idevent/plans/create
export const CreatePlanBody = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 64 }),
  date: Type.String({ format: "date" }),
  startTime: Type.Optional(Type.String({ format: "time" })),
  endTime: Type.Optional(Type.String({ format: "time" })),
  allDay: Type.Optional(Type.Boolean()),
  activity: Type.Optional(Type.String()),
  location: Type.String({ minLength: 1 }),
  minBudget: Type.Optional(Type.Integer()),
  maxBudget: Type.Optional(Type.Integer()),
});
export type CreatePlanBody = Type.Static<typeof CreatePlanBody>;

// PATCH /groups/:idgroup/events/:idevent/plans/:idplan/edit
export const EditPlanBody = Type.Object({
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 64 })),
  date: Type.Optional(Type.String({ format: "date" })),
  startTime: Type.Optional(Type.String({ format: "time" })),
  endTime: Type.Optional(Type.String({ format: "time" })),
  allDay: Type.Optional(Type.Boolean()),
  activity: Type.Optional(nullable(Type.String())),
  location: Type.Optional(Type.String({ minLength: 1 })),
  minBudget: Type.Optional(nullable(Type.Integer())),
  maxBudget: Type.Optional(nullable(Type.Integer())),
});
export type EditPlanBody = Type.Static<typeof EditPlanBody>;

// Parameters
export const PlanIdParam = Type.Object({
  id: Type.String({ format: "uuid" }),
  idevent: Type.String({ format: "uuid" }),
  idplan: Type.String({ format: "uuid" }),
});
export type PlanIdParam = Type.Static<typeof PlanIdParam>;
