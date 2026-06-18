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
} from "@baza/shared-types";
import { apiClient } from "./apiClient";

export const eventService = {
  // ==========================================
  // Personal Events (from /users/:username/events)
  // ==========================================

  // GET /v1/restricted/users/:username/events
  getPersonalEvents: (username: string, query?: GetPersonalEventsParams) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.set("startDate", query.startDate);
    if (query?.endDate) params.set("endDate", query.endDate);
    const queryString = params.toString();
    return apiClient<PersonalEventDTO[]>(
      `/v1/restricted/users/${username}/events${queryString ? `?${queryString}` : ""}`
    );
  },

  // GET /v1/restricted/users/:username/events/:idEvent
  getPersonalEvent: (username: string, idEvent: string) =>
    apiClient<PersonalEventDTO>(`/v1/restricted/users/${username}/events/${idEvent}`),

  // POST /v1/restricted/users/:username/events
  createPersonalEvent: (username: string, body: CreatePersonalEventBody) =>
    apiClient<PersonalEventDTO>(`/v1/restricted/users/${username}/events`, {
      method: "POST",
      json: body,
    }),

  // PATCH /v1/restricted/users/:username/events/:idEvent
  editPersonalEvent: (username: string, idEvent: string, body: EditPersonalEventBody) =>
    apiClient<PersonalEventDTO>(`/v1/restricted/users/${username}/events/${idEvent}`, {
      method: "PATCH",
      json: body,
    }),

  // ==========================================
  // Group Events (from /groups/:id/events)
  // ==========================================

  // POST /v1/restricted/groups/:id/events
  createGroupEvent: (groupId: string, body: CreateEventBody) =>
    apiClient<GroupEventDTO>(`/v1/restricted/groups/${groupId}/events`, {
      method: "POST",
      json: body,
    }),

  // GET /v1/restricted/groups/:id/events
  listGroupEvents: (groupId: string, query?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.set("startDate", query.startDate);
    if (query?.endDate) params.set("endDate", query.endDate);
    const queryString = params.toString();
    return apiClient<GroupEventDTO[]>(
      `/v1/restricted/groups/${groupId}/events${queryString ? `?${queryString}` : ""}`
    );
  },

  // GET /v1/restricted/groups/:id/calendar
  getGroupCalendar: (groupId: string, query?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (query?.startDate) params.set("startDate", query.startDate);
    if (query?.endDate) params.set("endDate", query.endDate);
    const queryString = params.toString();
    return apiClient<GroupCalendarDTO>(
      `/v1/restricted/groups/${groupId}/calendar${queryString ? `?${queryString}` : ""}`
    );
  },

  // GET /v1/restricted/groups/:id/events/:idevent
  getGroupEvent: (groupId: string, idEvent: string) =>
    apiClient<GroupEventDTO>(`/v1/restricted/groups/${groupId}/events/${idEvent}`),

  // PATCH /v1/restricted/groups/:id/events/:idevent
  editGroupEvent: (groupId: string, idEvent: string, body: EditEventBody) =>
    apiClient<GroupEventDTO>(`/v1/restricted/groups/${groupId}/events/${idEvent}`, {
      method: "PATCH",
      json: body,
    }),

  // POST /v1/restricted/groups/:id/events/:idevent/resolve-tie
  resolveTie: (groupId: string, idEvent: string, body: ResolveTieBody) =>
    apiClient<{ message: string }>(`/v1/restricted/groups/${groupId}/events/${idEvent}/resolve-tie`, {
      method: "POST",
      json: body,
    }),

  // ==========================================
  // Attendance Confirmations
  // ==========================================

  // POST /v1/restricted/groups/:id/events/:idevent/confirmations
  confirmEventAttendance: (groupId: string, idEvent: string) =>
    apiClient<EventConfirmationDTO>(`/v1/restricted/groups/${groupId}/events/${idEvent}/confirmations`, {
      method: "POST",
    }),

  // DELETE /v1/restricted/groups/:id/events/:idevent/confirmations
  revokeEventAttendance: (groupId: string, idEvent: string) =>
    apiClient<null>(`/v1/restricted/groups/${groupId}/events/${idEvent}/confirmations`, {
      method: "DELETE",
    }),

  // GET /v1/restricted/groups/:id/events/:idevent/confirmations
  getEventConfirmations: (groupId: string, idEvent: string) =>
    apiClient<EventConfirmationDTO[]>(`/v1/restricted/groups/${groupId}/events/${idEvent}/confirmations`),

  // ==========================================
  // Planning Preferences
  // ==========================================

  // POST /v1/restricted/groups/:id/events/:idevent/preferences
  createOrEditEventPreference: (groupId: string, idEvent: string, body: CreatePreferenceBody) =>
    apiClient<PreferenceDTO>(`/v1/restricted/groups/${groupId}/events/${idEvent}/preferences`, {
      method: "POST",
      json: body,
    }),

  // GET /v1/restricted/groups/:id/events/:idevent/preferences/group
  getGroupPreferenceReport: (groupId: string, idEvent: string) =>
    apiClient<GroupPreferenceReportDTO>(`/v1/restricted/groups/${groupId}/events/${idEvent}/preferences/group`),

  // GET /v1/restricted/groups/:id/events/:idevent/preferences
  getAllEventPreferences: (groupId: string, idEvent: string) =>
    apiClient<PreferenceDTO[]>(`/v1/restricted/groups/${groupId}/events/${idEvent}/preferences`),

  // GET /v1/restricted/groups/:id/events/:idevent/preferences/:username
  getUserPreference: (groupId: string, idEvent: string, username: string) =>
    apiClient<PreferenceDTO>(`/v1/restricted/groups/${groupId}/events/${idEvent}/preferences/${username}`),
};
