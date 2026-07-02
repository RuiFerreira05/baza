import {
  CreateGroupBody,
  EditGroupBody,
  GroupDTO,
  GroupMemberDTO,
  RespondGroupInviteBody,
  Result,
  StatusError,
  UpdateMemberRoleBody,
} from "@baza/shared-types";
import { apiClient, unwrapResult } from "./apiClient";

export const groupService = {
  // GET /v1/restricted/groups/:id
  getGroup: (id: string): Promise<Result<GroupDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${id}`).then(unwrapResult<GroupDTO>),

  // POST /v1/restricted/groups
  createGroup: (
    body: CreateGroupBody,
  ): Promise<Result<GroupDTO, StatusError>> =>
    apiClient("/v1/restricted/groups", {
      method: "POST",
      json: body,
    }).then(unwrapResult<GroupDTO>),

  // DELETE /v1/restricted/groups/:id
  deleteGroup: (id: string): Promise<Result<GroupDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${id}`, {
      method: "DELETE",
    }).then(unwrapResult<GroupDTO>),

  // PATCH /v1/restricted/groups/:id
  editGroup: (
    id: string,
    body: EditGroupBody,
  ): Promise<Result<GroupDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${id}`, {
      method: "PATCH",
      json: body,
    }).then(unwrapResult<GroupDTO>),

  // POST /v1/restricted/groups/:id/group-members
  inviteUser: (
    groupId: string,
    username: string,
  ): Promise<Result<GroupMemberDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/group-members`, {
      method: "POST",
      json: { username },
    }).then(unwrapResult<GroupMemberDTO>),

  // POST /v1/restricted/groups/:id/group-members/batch
  batchInviteUsers: (
    groupId: string,
    usernames: string[],
  ): Promise<Result<GroupMemberDTO[], StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/group-members/batch`, {
      method: "POST",
      json: { usernames },
    }).then(unwrapResult<GroupMemberDTO[]>),

  // DELETE /v1/restricted/groups/:id/group-members/:username
  removeUser: (
    groupId: string,
    username: string,
  ): Promise<Result<GroupMemberDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/group-members/${username}`, {
      method: "DELETE",
    }).then(unwrapResult<GroupMemberDTO>),

  // GET /v1/restricted/groups/:id/group-members
  listMembers: (
    groupId: string,
  ): Promise<Result<GroupMemberDTO[], StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/group-members`).then(
      unwrapResult<GroupMemberDTO[]>,
    ),

  // PATCH /v1/restricted/groups/:id/group-members/:username
  updateMemberRole: (
    groupId: string,
    username: string,
    body: UpdateMemberRoleBody,
  ): Promise<Result<GroupMemberDTO, StatusError>> =>
    apiClient(`/v1/restricted/groups/${groupId}/group-members/${username}`, {
      method: "PATCH",
      json: body,
    }).then(unwrapResult<GroupMemberDTO>),

  // GET /v1/restricted/users/:username/groups
  getUserGroups: (username: string): Promise<Result<GroupDTO[], StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/groups`).then(
      unwrapResult<GroupDTO[]>,
    ),

  // GET /v1/restricted/users/:username/groups/invites
  getUserGroupInvites: (
    username: string,
  ): Promise<Result<GroupDTO[], StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/groups/invites`).then(
      unwrapResult<GroupDTO[]>,
    ),

  // PATCH /v1/restricted/users/:username/groups/invites/:groupId
  respondGroupInvite: (
    username: string,
    groupId: string,
    body: RespondGroupInviteBody,
  ): Promise<Result<GroupMemberDTO | null, StatusError>> =>
    apiClient(`/v1/restricted/users/${username}/groups/invites/${groupId}`, {
      method: "PATCH",
      json: body,
    }).then(unwrapResult<GroupMemberDTO | null>),
};
