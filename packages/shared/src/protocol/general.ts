import { Type } from "typebox";

/**
 * Enum representing the different types of errors that can occur in the system.
 */
export enum ErrorTypes {
  /**
   * Indicates that a requested resource with a specific identifier was not found in
   * the system.
   */
  UnknownIdError = "UnknownIdError",
  /**
   * Indicates that a requested user with a specific username was not found in the system.
   */
  UnknownUsernameError = "UnknownUsernameError",
  /**
   * Indicates an error occurred while converting data from one format to another,
   * typically when validating data against a schema.
   */
  ConversionError = "ConversionError",
  /**
   * Indicates that an error occurred while trying to create a new resource in the database.
   */
  ResourceCreationError = "ResourceCreationError",
  /**
   * Indicates that the request sent by the client was malformed or missing required information.
   */
  MalformedRequestError = "MalformedRequestError",
  /**
   * Indicates that an operation failed because a resource with the same identifier or
   * unique property already exists.
   */
  ExistingResourceError = "ExistingResourceError",
  /**
   * Indicates that an error occurred while trying to update an existing resource.
   */
  UpdateError = "UpdateError",
  /**
   * Indicates that an error occurred while trying to delete a resource.
   */
  DeleteError = "DeleteError",
  /**
   * Indicates that the user is not authenticated or authorized to perform the action.
   */
  UnauthorizedError = "UnauthorizedError",
}

export type Result<T, E> = Ok<T> | Err<E>;
export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };

export const Ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const Err = <E>(error: E): Err<E> => ({ ok: false, error });

/**
 * Creates a schema for a successful "OK" response.
 *
 * @param schema The schema for the data being returned
 * @param description A description of the response
 * @returns A TypeBox object schema for the OK response
 */
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

/**
 * Type representing an "OK" response with a specific data schema.
 */
export type StatusOK<T> = {
  status: "OK";
  data: T;
};

/**
 * Creates a schema for an "ERROR" response.
 *
 * @param type The type of error
 * @param description A description of the error response
 * @returns A TypeBox object schema for the error response
 */
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

/**
 * Type representing an "ERROR" response with a specific error type.
 */
export type StatusError<T extends ErrorTypes = ErrorTypes> = {
  status: "ERROR";
  error: {
    type: T;
    message: string;
  };
};

/**
 * Internal helper to create a generic error schema.
 *
 * @param type The error type literal
 * @returns A TypeBox object schema
 */
const genericError = (type: ErrorTypes) =>
  Type.Object({
    type: Type.Literal(type),
    message: Type.String({
      description: "A human readable error message",
    }),
  });

/**
 * Creates a runtime "OK" response object.
 *
 * @param data The data to include in the response
 * @returns An object with status "OK" and the data
 */
export const createStatusOK = <T>(data: T) => ({
  status: "OK" as const,
  data,
});

/**
 * Creates a runtime "ERROR" response object.
 *
 * @param type The type of error
 * @param message A human-readable error message
 * @returns An object with status "ERROR" and the error details
 */
export const createStatusError = (type: ErrorTypes, message: string) => ({
  status: "ERROR" as const,
  error: { type, message },
});

/**
 * This type represents an operation that may return some data of type T
 */
export type Maybe<T> = T | undefined;

/**
 * Represents an operation that can fail but doesn't return a value on success.
 */
export type Failable<E> = Result<void, E>;

/**
 * Creates a successful Failable result.
 *
 * @returns A successful result with no value
 */
export const FailableOk = () => Ok(undefined);

/**
 * Makes a schema nullable by creating a union with Type.Null().
 *
 * @param schema The schema to make nullable
 * @returns A TypeBox union schema
 */
export const nullable = <T extends Type.TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()]);

/**
 * Creates a schema for a request parameter containing a UUID 'id'.
 *
 * @param description A description of the parameter
 * @returns A TypeBox object schema
 */
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

/**
 * Type representing a parameter schema containing a UUID 'id'.
 */
export type SimpleIdParam = Type.Static<ReturnType<typeof SimpleIdParam>>;

/**
 * Creates a schema for a request parameter containing a 'username'.
 *
 * @param description A description of the parameter
 * @returns A TypeBox object schema
 */
export const SimpleUsernameParam = (description: string) =>
  Type.Object(
    {
      username: Type.String(),
    },
    {
      description,
    },
  );

/**
 * Type representing a parameter schema containing a 'username'.
 */
export type SimpleUsernameParam = Type.Static<
  ReturnType<typeof SimpleUsernameParam>
>;
