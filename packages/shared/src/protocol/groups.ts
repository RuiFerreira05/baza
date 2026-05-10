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

// GET /groups/:id
export const getGroupByIdParams = Type.Object({
  id: Type.String({
    description: "Group UUID",
    format: "uuid",
  }),
});
export type getGroupByIdParams = Type.Static<typeof getGroupByIdParams>;

// POST /groups/create
export const createGroupBody = Type.Object({
  groupName: Type.String({
    description: "The name of the group being created"
  })
})
export type createGroupBody = Type.Static<typeof createGroupBody>;

// PATCH /groups/:id/edit/photo
export const editGroupPhotoParams = Type.Object({
  id: Type.String({
    description: "Group UUID",
    format: "uuid",
  }),
})
export type editGroupPhotoParams = Type.Static<typeof editGroupPhotoParams>;