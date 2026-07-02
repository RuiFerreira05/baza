import {
  PersonalEventDTO,
  CreatePersonalEventBody,
  EditPersonalEventBody,
  GetPersonalEventsParams,
  GroupEventDTO,
  CreateEventBody,
  EditEventBody,
  GroupCalendarDTO,
  EventConfirmationDTO,
  GroupPreferenceReportDTO,
  PreferenceDTO,
  CreatePreferenceBody,
  ResolveTieBody,
  Result,
  StatusError,
} from "@baza/shared-types";
import { apiClient, unwrapResult } from "./apiClient";

export const eventService = {
  // ==========================================
  // Personal Events (from /users/:username/events)
  // ==========================================

  // GET /v1/restricted/users/:username/events
  getPersonalEvents: (
    username: string,
    query?: GetPersonalEventsParams,
  ): Promise<Result<PersonalEventDTO[], StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/events`, {
      params: query,
    }).then(unwrapResult<PersonalEventDTO[]>),

  // GET /v1/restricted/users/:username/events/:idEvent
  getPersonalEvent: (
    username: string,
    idEvent: string,
  ): Promise<Result<PersonalEventDTO, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/events/${idEvent}`).then(
      unwrapResult<PersonalEventDTO>,
    ),

  // POST /v1/restricted/users/:username/events
  createPersonalEvent: (
    username: string,
    body: CreatePersonalEventBody,
  ): Promise<Result<PersonalEventDTO, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/events`, {
      method: "POST",
      json: body,
    }).then(unwrapResult<PersonalEventDTO>),

  // PATCH /v1/restricted/users/:username/events/:idEvent
  editPersonalEvent: (
    username: string,
    idEvent: string,
    body: EditPersonalEventBody,
  ): Promise<Result<PersonalEventDTO, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/events/${idEvent}`, {
      method: "PATCH",
      json: body,
    }).then(unwrapResult<PersonalEventDTO>),

  // DELETE /v1/restricted/users/:username/events/:idEvent
  deletePersonalEvent: (
    username: string,
    idEvent: string,
  ): Promise<Result<null, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/events/${idEvent}`, {
      method: "DELETE",
    }).then(unwrapResult<null>),

  // ==========================================
  // Group Events (from /groups/:id/events)
  // ==========================================

  // POST /v1/restricted/groups/:id/events
  createGroupEvent: (
    groupId: string,
    body: CreateEventBody,
  ): Promise<Result<GroupEventDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/events`, {
      method: "POST",
      json: body,
    }).then(unwrapResult<GroupEventDTO>),

  // GET /v1/restricted/groups/:id/events
  listGroupEvents: (
    groupId: string,
    query?: { startDate?: string; endDate?: string },
  ): Promise<Result<GroupEventDTO[], StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/events`, {
      params: query,
    }).then(unwrapResult<GroupEventDTO[]>),

  // GET /v1/restricted/groups/:id/calendar
  getGroupCalendar: (
    groupId: string,
    query: { startDate: string; endDate: string },
  ): Promise<Result<GroupCalendarDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/calendar`, {
      params: query,
    }).then(unwrapResult<GroupCalendarDTO>),

  // GET /v1/restricted/groups/:id/events/:idevent
  getGroupEvent: (
    groupId: string,
    idEvent: string,
  ): Promise<Result<GroupEventDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/events/${idEvent}`).then(
      unwrapResult<GroupEventDTO>,
    ),

  // PATCH /v1/restricted/groups/:id/events/:idevent
  editGroupEvent: (
    groupId: string,
    idEvent: string,
    body: EditEventBody,
  ): Promise<Result<GroupEventDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/events/${idEvent}`, {
      method: "PATCH",
      json: body,
    }).then(unwrapResult<GroupEventDTO>),

  // DELETE /v1/restricted/groups/:id/events/:idevent
  deleteGroupEvent: (
    groupId: string,
    idEvent: string,
  ): Promise<Result<null, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/events/${idEvent}`, {
      method: "DELETE",
    }).then(unwrapResult<null>),

  // POST /v1/restricted/groups/:id/events/:idevent/resolve-tie
  resolveTie: (
    groupId: string,
    idEvent: string,
    body: ResolveTieBody,
  ): Promise<Result<{ message: string }, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/resolve-tie`,
      {
        method: "POST",
        json: body,
      },
    ).then(unwrapResult<{ message: string }>),

  // ==========================================
  // Attendance Confirmations
  // ==========================================

  // POST /v1/restricted/groups/:id/events/:idevent/confirmations
  confirmEventAttendance: (
    groupId: string,
    idEvent: string,
  ): Promise<Result<EventConfirmationDTO, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/confirmations`,
      {
        method: "POST",
      },
    ).then(unwrapResult<EventConfirmationDTO>),

  // DELETE /v1/restricted/groups/:id/events/:idevent/confirmations
  revokeEventAttendance: (
    groupId: string,
    idEvent: string,
  ): Promise<Result<null, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/confirmations`,
      {
        method: "DELETE",
      },
    ).then(unwrapResult<null>),

  // GET /v1/restricted/groups/:id/events/:idevent/confirmations
  getEventConfirmations: (
    groupId: string,
    idEvent: string,
  ): Promise<Result<EventConfirmationDTO[], StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/confirmations`,
    ).then(unwrapResult<EventConfirmationDTO[]>),

  // ==========================================
  // Planning Preferences
  // ==========================================

  // POST /v1/restricted/groups/:id/events/:idevent/preferences
  createOrEditEventPreference: (
    groupId: string,
    idEvent: string,
    body: CreatePreferenceBody,
  ): Promise<Result<PreferenceDTO, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/preferences`,
      {
        method: "POST",
        json: body,
      },
    ).then(unwrapResult<PreferenceDTO>),

  // GET /v1/restricted/groups/:id/events/:idevent/preferences/group
  getGroupPreferenceReport: (
    groupId: string,
    idEvent: string,
  ): Promise<Result<GroupPreferenceReportDTO, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/preferences/group`,
    ).then(unwrapResult<GroupPreferenceReportDTO>),

  // GET /v1/restricted/groups/:id/events/:idevent/preferences
  getAllEventPreferences: (
    groupId: string,
    idEvent: string,
  ): Promise<Result<PreferenceDTO[], StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/preferences`,
    ).then(unwrapResult<PreferenceDTO[]>),

  // GET /v1/restricted/groups/:id/events/:idevent/preferences/:username
  getUserPreference: (
    groupId: string,
    idEvent: string,
    username: string,
  ): Promise<Result<PreferenceDTO, StatusError>> =>
    apiClient(
      `/v1/restricted/groups/${groupId}/events/${idEvent}/preferences/${username}`,
    ).then(unwrapResult<PreferenceDTO>),
};
