import { Type } from "typebox";
import { nullable } from "./general";

// ########### DTO ##########
export const groupDTO = Type.Object({
  id: Type.String({
    description: "Group UUID",
    format: "uuid",
  }),
  groupname: Type.String({
    description: "The name of the group",
  }),
  description: nullable(
    Type.String({
      description: "A short description of the group",
    }),
  ),
  photo: nullable(
    Type.String({
      description: "A URL to the group's photo",
    }),
  ),
});
export type GroupDTO = Type.Static<typeof groupDTO>;

export const groupMemberDTO = Type.Object({
  username: Type.String({
    description: "The username of the group member",
  }),
  groupId: Type.String({
    description: "The UUID of the group",
    format: "uuid",
  }),
  admin: Type.Boolean({
    description: "Whether the group member is an admin of the group",
  }),
  banned: Type.Boolean({
    description: "Whether the group member is banned from the group",
  }),
  acceptedInvite: Type.Boolean({
    description: "Whether the group member has accepted their invite to the group",
  }),
});
export type GroupMemberDTO = Type.Static<typeof groupMemberDTO>;
// username: text("username").notNull().references(() => profiles.username),
// groupId: uuid("group_id").notNull().references(() => groups.id),
// admin: boolean("admin").notNull(),
// banned: boolean("banned").default(false).notNull(),
// bannedAt: timestamp("banned_at"),
// acceptedInvite: boolean("accepted_invite").notNull(),
// acceptedAt: timestamp("accepted_at"),
// invitedAt: timestamp("invited_at").notNull(),

// #### Route specific Schemas ####

// POST /groups/create
export const CreateGroupBody = Type.Object({
  groupName: Type.String({
    description: "The name of the group being created",
  }),
});
export type CreateGroupBody = Type.Static<typeof CreateGroupBody>;

// PATCH /groups/:id/edit
export const EditGroupBody = Type.Object({
  groupName: Type.Optional(
    Type.String({
      description:
        "The new name of the group. If not provided, the group name will not be changed",
    }),
  ),
  description: Type.Optional(
    Type.String({
      description:
        "The new description of the group. If not provided, the group description will not be changed",
    }),
  ),
});
export type EditGroupBody = Type.Static<typeof EditGroupBody>;