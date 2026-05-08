import { Type } from "typebox";

export enum ErrorTypes {
  UnknownIdError,
  ConversionError,
  ResourceCreationError,
}

export const errorSchema = Type.Object({
  type: Type.Enum({ ...ErrorTypes }, {
    description: "The type of the error",
  }),
  message: Type.String({
    description: "A human readable error message",
  }),
}, {
  description: "A generic error schema that can be used for all routes",
});
export type ErrorSchema = Type.Static<typeof errorSchema>;
