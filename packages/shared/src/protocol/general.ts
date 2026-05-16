import { Type } from "typebox";

export enum ErrorTypes {
  UnknownIdError = "UnknownIdError",
  UnknownUsernameError = "UnknownUsernameError",
  ConversionError = "ConversionError",
  ResourceCreationError = "ResourceCreationError",
  MalformedRequestError = "MalformedRequestError",
  ExistingResourceError = "ExistingResourceError",
  UpdateError = "UpdateError",
  DeleteError = "DeleteError",
}

export const StatusOK = <T extends Type.TSchema>(
  schema: T,
  description: string,
) =>
  Type.Object(
    {
      status: Type.Literal("OK"),
      data: schema,
    },
    {
      description,
    },
  );
export type StatusOK<T extends Type.TSchema> = Type.Static<
  ReturnType<typeof StatusOK<T>>
>;

export const StatusError = (type: ErrorTypes, description: string) =>
  Type.Object(
    {
      status: Type.Literal("ERROR"),
      error: genericError(type),
    },
    {
      description,
    },
  );

export type StatusError<T extends ErrorTypes = ErrorTypes> = {
  status: "ERROR";
  error: {
    type: T;
    message: string;
  };
};

const genericError = (type: ErrorTypes) =>
  Type.Object({
    type: Type.Literal(type),
    message: Type.String({
      description: "A human readable error message",
    }),
  });

export const createStatusOK = <T>(data: T) => ({
  status: "OK" as const,
  data,
});

export const createStatusError = (type: ErrorTypes, message: string) => ({
  status: "ERROR" as const,
  error: { type, message },
});

export const nullable = <T extends Type.TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()]);

export const SimpleIdParam = (description: string) =>
  Type.Object(
    {
      id: Type.String({
        format: "uuid",
      }),
    },
    {
      description,
    },
  );
export type SimpleIdParam = Type.Static<ReturnType<typeof SimpleIdParam>>;

export const SimpleUsernameParam = (description: string) =>
  Type.Object(
    {
      username: Type.String(),
    },
    {
      description,
    },
  );
export type SimpleUsernameParam = Type.Static<
  ReturnType<typeof SimpleUsernameParam>
>;
