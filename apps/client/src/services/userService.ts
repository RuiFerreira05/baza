import {
  BlockUserBody,
  CreateProfileBody,
  EditProfileBody,
  FriendRequestDTO,
  ProfileDTO,
  RespondFriendRequestBody,
  Result,
  SendFriendRequestBody,
  SentFriendRequestDTO,
  StatusError,
} from "@baza/shared-types";
import { apiClient, unwrapResult } from "./apiClient";

export const userService = {
  // GET /v1/restricted/users/:username
  getProfile: (username: string): Promise<Result<ProfileDTO, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}`).then(
      unwrapResult<ProfileDTO>,
    ),

  // GET /v1/restricted/users/me
  getCurrentProfile: (): Promise<Result<ProfileDTO, StatusError>> =>
    apiClient("/v1/restricted/users/me").then(unwrapResult<ProfileDTO>),

  // POST /v1/restricted/users
  createProfile: (
    body: CreateProfileBody,
  ): Promise<Result<ProfileDTO, StatusError>> =>
    apiClient("/v1/restricted/users", {
      method: "POST",
      json: body,
    }).then(unwrapResult<ProfileDTO>),

  // DELETE /v1/restricted/users/:username
  deleteProfile: (username: string): Promise<Result<ProfileDTO, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}`, {
      method: "DELETE",
    }).then(unwrapResult<ProfileDTO>),

  // PATCH /v1/restricted/users/:username
  editProfile: (
    username: string,
    body: EditProfileBody,
  ): Promise<Result<ProfileDTO, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}`, {
      method: "PATCH",
      json: body,
    }).then(unwrapResult<ProfileDTO>),

  // PATCH /v1/restricted/users/:username/photo
  editProfilePhoto: (
    username: string,
    imageUri: string,
  ): Promise<Result<ProfileDTO, StatusError>> => {
    const formData = new FormData();

    formData.append("photo", {
      uri: imageUri,
      type: "image/png",
      name: `{$username}_photo.png`,
    } as any);

    return apiClient(`/v1/restricted/users/${username}/photo`, {
      method: "PATCH",
      body: formData,
    }).then(unwrapResult<ProfileDTO>);
  },

  // DELETE /v1/restricted/users/:username/photo
  deleteProfilePhoto: (
    username: string,
  ): Promise<Result<ProfileDTO, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/photo`, {
      method: "DELETE",
    }).then(unwrapResult<ProfileDTO>),

  // GET /v1/restricted/users/:username/friends
  getFriends: (username: string): Promise<Result<ProfileDTO[], StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/friends`).then(
      unwrapResult<ProfileDTO[]>,
    ),

  // GET /v1/restricted/users/:username/friends/:friendUsername
  getFriendProfile: (
    username: string,
    friendUsername: string,
  ): Promise<Result<ProfileDTO, StatusError>> =>
    apiClient(
      `/v1/restricted/users/${username}/friends/${friendUsername}`,
    ).then(unwrapResult<ProfileDTO>),

  // DELETE /v1/restricted/users/:username/friends/:friendUsername
  removeFriend: (
    username: string,
    friendUsername: string,
  ): Promise<Result<null, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/friends/${friendUsername}`, {
      method: "DELETE",
    }).then(unwrapResult<null>),

  // POST /v1/restricted/users/:username/friends/requests
  sendFriendRequest: (
    username: string,
    body: SendFriendRequestBody,
  ): Promise<Result<null, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/friends/requests`, {
      method: "POST",
      json: body,
    }).then(unwrapResult<null>),

  // GET /v1/restricted/users/:username/friends/requests
  getPendingFriendRequests: (
    username: string,
  ): Promise<Result<FriendRequestDTO[], StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/friends/requests`).then(
      unwrapResult<FriendRequestDTO[]>,
    ),

  // GET /v1/restricted/users/:username/friends/requests/sent
  getPendingSentFriendRequests: (
    username: string,
  ): Promise<Result<SentFriendRequestDTO[], StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/friends/requests/sent`).then(
      unwrapResult<SentFriendRequestDTO[]>,
    ),

  // PATCH /v1/restricted/users/:username/friends/requests/:senderUsername
  respondFriendRequest: (
    username: string,
    senderUsername: string,
    body: RespondFriendRequestBody,
  ): Promise<Result<null, StatusError>> =>
    apiClient(
      `/v1/restricted/users/${username}/friends/requests/${senderUsername}`,
      {
        method: "PATCH",
        json: body,
      },
    ).then(unwrapResult<null>),

  // POST /v1/restricted/users/:username/blocks
  blockUser: (
    username: string,
    body: BlockUserBody,
  ): Promise<Result<null, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/blocks`, {
      method: "POST",
      json: body,
    }).then(unwrapResult<null>),

  // DELETE /v1/restricted/users/:username/blocks/:blockedUsername
  unblockUser: (
    username: string,
    blockedUsername: string,
  ): Promise<Result<null, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/blocks/${blockedUsername}`, {
      method: "DELETE",
    }).then(unwrapResult<null>),

  // GET /v1/restricted/users/:username/settings
  getSettings: (username: string): Promise<Result<any, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/settings`).then(
      unwrapResult<any>,
    ),

  // PATCH /v1/restricted/users/:username/settings
  updateSettings: (
    username: string,
    body: any,
  ): Promise<Result<any, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/settings`, {
      method: "PATCH",
      json: body,
    }).then(unwrapResult<any>),
};
