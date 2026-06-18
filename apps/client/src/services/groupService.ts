import {
  GroupDTO,
  CreateGroupBody,
  EditGroupBody,
  GroupMemberDTO,
  RespondGroupInviteBody,
  UpdateMemberRoleBody,
} from "@baza/shared-types";
import { apiClient } from "./apiClient";

export const groupService = {
  // GET /v1/restricted/groups/:id
  getGroup: (id: string) => apiClient<GroupDTO>(`/v1/restricted/groups/${id}`),

  // POST /v1/restricted/groups
  createGroup: (body: CreateGroupBody) =>
    apiClient<GroupDTO>("/v1/restricted/groups", {
      method: "POST",
      json: body,
    }),

  // DELETE /v1/restricted/groups/:id
  deleteGroup: (id: string) =>
    apiClient<GroupDTO>(`/v1/restricted/groups/${id}`, {
      method: "DELETE",
    }),

  // PATCH /v1/restricted/groups/:id
  editGroup: (id: string, body: EditGroupBody) =>
    apiClient<GroupDTO>(`/v1/restricted/groups/${id}`, {
      method: "PATCH",
      json: body,
    }),

  // POST /v1/restricted/groups/:id/group-members
  inviteUser: (groupId: string, username: string) =>
    apiClient<GroupMemberDTO>(
      `/v1/restricted/groups/${groupId}/group-members`,
      {
        method: "POST",
        json: { username },
      },
    ),

  // DELETE /v1/restricted/groups/:id/group-members/:username
  removeUser: (groupId: string, username: string) =>
    apiClient<GroupMemberDTO>(
      `/v1/restricted/groups/${groupId}/group-members/${username}`,
      {
        method: "DELETE",
      },
    ),

  // GET /v1/restricted/groups/:id/group-members
  listMembers: (groupId: string) =>
    apiClient<GroupMemberDTO[]>(
      `/v1/restricted/groups/${groupId}/group-members`,
    ),

  // PATCH /v1/restricted/groups/:id/group-members/:username
  updateMemberRole: (
    groupId: string,
    username: string,
    body: UpdateMemberRoleBody,
  ) =>
    apiClient<GroupMemberDTO>(
      `/v1/restricted/groups/${groupId}/group-members/${username}`,
      {
        method: "PATCH",
        json: body,
      },
    ),

  // GET /v1/restricted/users/:username/groups
  getUserGroups: (username: string) =>
    apiClient<GroupDTO[]>(`/v1/restricted/users/${username}/groups`),

  // GET /v1/restricted/users/:username/groups/invites
  getUserGroupInvites: (username: string) =>
    apiClient<GroupDTO[]>(`/v1/restricted/users/${username}/groups/invites`),

  // PATCH /v1/restricted/users/:username/groups/invites/:groupId
  respondGroupInvite: (
    username: string,
    groupId: string,
    body: RespondGroupInviteBody,
  ) =>
    apiClient<GroupMemberDTO | null>(
      `/v1/restricted/users/${username}/groups/invites/${groupId}`,
      {
        method: "PATCH",
        json: body,
      },
    ),
};
