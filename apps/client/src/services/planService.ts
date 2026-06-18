import { PlanDTO, CreatePlanBody, EditPlanBody } from "@baza/shared-types";
import { apiClient } from "./apiClient";

export const planService = {
  // GET /v1/restricted/groups/:id/events/:idevent/plans
  getPlans: (groupId: string, idEvent: string) =>
    apiClient<PlanDTO[]>(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans`,
    ),

  // POST /v1/restricted/groups/:id/events/:idevent/plans
  createPlan: (groupId: string, idEvent: string, body: CreatePlanBody) =>
    apiClient<PlanDTO>(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans`,
      {
        method: "POST",
        json: body,
      },
    ),

  // GET /v1/restricted/groups/:id/events/:idevent/plans/:idplan
  getPlan: (groupId: string, idEvent: string, idPlan: string) =>
    apiClient<PlanDTO>(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans/${idPlan}`,
    ),

  // PATCH /v1/restricted/groups/:id/events/:idevent/plans/:idplan
  editPlan: (
    groupId: string,
    idEvent: string,
    idPlan: string,
    body: EditPlanBody,
  ) =>
    apiClient<PlanDTO>(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans/${idPlan}`,
      {
        method: "PATCH",
        json: body,
      },
    ),

  // POST /v1/restricted/groups/:id/events/:idevent/plans/:idplan/votes
  submitVote: (groupId: string, idEvent: string, idPlan: string) =>
    apiClient<{ message: string }>(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans/${idPlan}/votes`,
      {
        method: "POST",
      },
    ),

  // DELETE /v1/restricted/groups/:id/events/:idevent/plans/:idplan/votes
  removeVote: (groupId: string, idEvent: string, idPlan: string) =>
    apiClient<{ message: string }>(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans/${idPlan}/votes`,
      {
        method: "DELETE",
      },
    ),
};
