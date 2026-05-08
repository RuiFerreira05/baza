import { Type } from "typebox";

// ########### DTO ##########
export const groupDTO = Type.Object({
  id: Type.String({
    description: "Group UUID",
    format: "uuid",
  }),
  groupname: Type.String({
    description: "The name of the group",
  }),
  description: Type.Optional(Type.String({
    description: "The group's description"
  })),
  photo: Type.Optional(Type.String({
    description: "The uuid of the group's photo inside the server",
    format: "uuid",
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