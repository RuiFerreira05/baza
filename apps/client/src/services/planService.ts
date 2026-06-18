import {
  PlanDTO,
  CreatePlanBody,
  EditPlanBody,
  Result,
  StatusError,
} from "@baza/shared-types";
import { apiClient, unwrapResult } from "./apiClient";

export const planService = {
  // GET /v1/restricted/groups/:id/events/:idevent/plans
  getPlans: (
    groupId: string,
    idEvent: string,
  ): Promise<Result<PlanDTO[], StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/events/${idEvent}/plans`).then(
      unwrapResult<PlanDTO[]>,
    ),

  // POST /v1/restricted/groups/:id/events/:idevent/plans
  createPlan: (
    groupId: string,
    idEvent: string,
    body: CreatePlanBody,
  ): Promise<Result<PlanDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/events/${idEvent}/plans`, {
      method: "POST",
      json: body,
    }).then(unwrapResult<PlanDTO>),

  // GET /v1/restricted/groups/:id/events/:idevent/plans/:idplan
  getPlan: (
    groupId: string,
    idEvent: string,
    idPlan: string,
  ): Promise<Result<PlanDTO, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans/${idPlan}`,
    ).then(unwrapResult<PlanDTO>),

  // PATCH /v1/restricted/groups/:id/events/:idevent/plans/:idplan
  editPlan: (
    groupId: string,
    idEvent: string,
    idPlan: string,
    body: EditPlanBody,
  ): Promise<Result<PlanDTO, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans/${idPlan}`,
      {
        method: "PATCH",
        json: body,
      },
    ).then(unwrapResult<PlanDTO>),

  // POST /v1/restricted/groups/:id/events/:idevent/plans/:idplan/votes
  submitVote: (
    groupId: string,
    idEvent: string,
    idPlan: string,
  ): Promise<Result<{ message: string }, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans/${idPlan}/votes`,
      {
        method: "POST",
      },
    ).then(unwrapResult<{ message: string }>),

  // DELETE /v1/restricted/groups/:id/events/:idevent/plans/:idplan/votes
  removeVote: (
    groupId: string,
    idEvent: string,
    idPlan: string,
  ): Promise<Result<{ message: string }, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/plans/${idPlan}/votes`,
      {
        method: "DELETE",
      },
    ).then(unwrapResult<{ message: string }>),
};
