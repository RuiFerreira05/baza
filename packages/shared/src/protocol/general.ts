import { Type } from "typebox";

export enum ErrorTypes {
  UnknownIdError = "UnknownIdError",
  UnknownUsernameError = "UnknownUsernameError",
  ConversionError = "ConversionError",
  ResourceCreationError = "ResourceCreationError",
  MalformedRequestError = "MalformedRequestError",
  ExistingResourceError = "ExistingResourceError",
}

export const genericError = (type: ErrorTypes, description: string) =>
  Type.Object(
    {
      type: Type.Literal(type),
      message: Type.String({
        description: "A human readable error message",
      }),
    },
    {
      description,
    },
  );

export const nullable = <T extends Type.TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()]);

export const SimpleIdParam = (description: string) => Type.Object({
  id: Type.String({
    description: description,
    format: "uuid",
  }),
});
export type SimpleIdParam = Type.Static<ReturnType<typeof SimpleIdParam>>;