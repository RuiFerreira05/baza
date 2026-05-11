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
  description: nullable(Type.String({
    description: "A short description of the group"
  })),
  photo: nullable(Type.String({
    description: "A URL to the group's photo"
  }))
});
export type GroupDTO = Type.Static<typeof groupDTO>;

// #### Route specific Schemas ####

// POST /groups/create
export const CreateGroupBody = Type.Object({
  groupName: Type.String({
    description: "The name of the group being created"
  })
})
export type CreateGroupBody = Type.Static<typeof CreateGroupBody>;

// PATCH /groups/:id/edit
export const EditGroupBody = Type.Object({
  groupName: Type.Optional(Type.String({
    description: "The new name of the group. If not provided, the group name will not be changed"
  })),
  description: Type.Optional(Type.String({
    description: "The new description of the group. If not provided, the group description will not be changed"
  }))
})
export type EditGroupBody = Type.Static<typeof EditGroupBody>;