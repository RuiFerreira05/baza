import {
  ProfileDTO,
  CreateProfileBody,
  EditProfileBody,
  SendFriendRequestBody,
  FriendRequestDTO,
  SentFriendRequestDTO,
  RespondFriendRequestBody,
  BlockUserBody,
} from "@baza/shared-types";
import { apiClient } from "./apiClient";

export const userService = {
  // GET /v1/restricted/users/:username
  getProfile: (username: string) =>
    apiClient<ProfileDTO>(`/v1/restricted/users/${username}`),

  // POST /v1/restricted/users
  createProfile: (body: CreateProfileBody) =>
    apiClient<ProfileDTO>("/v1/restricted/users", {
      method: "POST",
      json: body,
    }),

  // DELETE /v1/restricted/users/:username
  deleteProfile: (username: string) =>
    apiClient<ProfileDTO>(`/v1/restricted/users/${username}`, {
      method: "DELETE",
    }),

  // PATCH /v1/restricted/users/:username
  editProfile: (username: string, body: EditProfileBody) =>
    apiClient<ProfileDTO>(`/v1/restricted/users/${username}`, {
      method: "PATCH",
      json: body,
    }),

  // GET /v1/restricted/users/:username/friends
  getFriends: (username: string) =>
    apiClient<ProfileDTO[]>(`/v1/restricted/users/${username}/friends`),

  // GET /v1/restricted/users/:username/friends/:friendUsername
  getFriendProfile: (username: string, friendUsername: string) =>
    apiClient<ProfileDTO>(
      `/v1/restricted/users/${username}/friends/${friendUsername}`,
    ),

  // DELETE /v1/restricted/users/:username/friends/:friendUsername
  removeFriend: (username: string, friendUsername: string) =>
    apiClient<null>(
      `/v1/restricted/users/${username}/friends/${friendUsername}`,
      {
        method: "DELETE",
      },
    ),

  // POST /v1/restricted/users/:username/friends/requests
  sendFriendRequest: (username: string, body: SendFriendRequestBody) =>
    apiClient<null>(`/v1/restricted/users/${username}/friends/requests`, {
      method: "POST",
      json: body,
    }),

  // GET /v1/restricted/users/:username/friends/requests
  getPendingFriendRequests: (username: string) =>
    apiClient<FriendRequestDTO[]>(
      `/v1/restricted/users/${username}/friends/requests`,
    ),

  // GET /v1/restricted/users/:username/friends/requests/sent
  getPendingSentFriendRequests: (username: string) =>
    apiClient<SentFriendRequestDTO[]>(
      `/v1/restricted/users/${username}/friends/requests/sent`,
    ),

  // PATCH /v1/restricted/users/:username/friends/requests/:senderUsername
  respondFriendRequest: (
    username: string,
    senderUsername: string,
    body: RespondFriendRequestBody,
  ) =>
    apiClient<null>(
      `/v1/restricted/users/${username}/friends/requests/${senderUsername}`,
      {
        method: "PATCH",
        json: body,
      },
    ),

  // POST /v1/restricted/users/:username/blocks
  blockUser: (username: string, body: BlockUserBody) =>
    apiClient<null>(`/v1/restricted/users/${username}/blocks`, {
      method: "POST",
      json: body,
    }),

  // DELETE /v1/restricted/users/:username/blocks/:blockedUsername
  unblockUser: (username: string, blockedUsername: string) =>
    apiClient<null>(
      `/v1/restricted/users/${username}/blocks/${blockedUsername}`,
      {
        method: "DELETE",
      },
    ),

  // GET /v1/restricted/users/:username/settings
  getSettings: (username: string) =>
    apiClient<any>(`/v1/restricted/users/${username}/settings`),

  // PATCH /v1/restricted/users/:username/settings
  updateSettings: (username: string, body: any) =>
    apiClient<any>(`/v1/restricted/users/${username}/settings`, {
      method: "PATCH",
      json: body,
    }),
};
