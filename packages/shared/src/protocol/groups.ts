import { Type } from "typebox";

export function SafeDate(
  options?: Parameters<typeof Type.Unsafe<Date>>[0] & {
    /** The date serialization format. Defaults to `datetime` (ISO-8601). */
    format: "date" | "datetime";
  },
) {
  return Type.Unsafe<Date>({ type: "string", format: "datetime", ...options });
}

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

export const getGroupByIdParams = Type.Object({
  id: Type.String({
    description: "Group UUID",
    format: "uuid",
  }),
});

export type getGroupByIdParams = Type.Static<typeof groupDTO>;