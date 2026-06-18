import type { ErrorTypes } from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import type { UUID } from "crypto";

/**
 * This type represents an operation that may return some data of type T
 */
export type Maybe<T> = T | undefined;

/**
 * This type represents the result of an operation that can either succeed with a value of type T or
 * fail with an error of type E. Contains a boolean 'ok' to indicate success or failure, and either
 * a 'value' of type T or an 'error' of type E depending on the outcome.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Represents a successful operation result.
 */
export type Ok<T> = { ok: true; value: T };

/**
 * Represents a failed operation result.
 */
export type Err<E> = { ok: false; error: E };

/**
 * Creates an Ok result with the provided value.
 *
 * @param value The success value
 * @returns An Ok result object
 */
export const Ok = <T>(value: T): Ok<T> => ({ ok: true, value });

/**
 * Creates an Err result with the provided error.
 *
 * @param error The error value
 * @returns An Err result object
 */
export const Err = <E>(error: E): Err<E> => ({ ok: false, error });

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
 * Represents the result of fetching an image, specifying how the image data is provided.
 */
export type GetImageResult =
  // | { type: "stream"; data: Readable; contentType: string } // alternate way for fs uploads, not currently implemented
  // | { type: "buffer"; data: Buffer; contentType: string } // used for db uploads, not currently implemented
  // | { type: "redirect"; url: string } // used for cloud uploads, not currently implemented
  { type: "static"; filename: string }; // used for fs files

/**
 * Errors that can occur during the setup of the application or its services.
 */
export enum SetupError {
  DirectoryCreationError = "DirectoryCreationError",
  PermissionError = "PermissionError",
  UnknownError = "UnknownError",
}

/**
 * Interface defining the methods required for a file upload service.
 */
export interface FileUploadInterface {
  /**
   * Saves a group photo and optionally removes the old one.
   *
   * @param photo The multipart file to save
   * @param oldPhoto The ID or path of the old photo to replace
   * @returns A promise resolving to the new photo's UUID or an error
   */
  saveGroupPhoto: (
    photo: MultipartFile,
    oldPhoto: string | null,
  ) => Promise<Result<UUID, ErrorTypes>>;

  /**
   * Retrieves a group photo by its ID.
   *
   * @param photoId The UUID of the photo to retrieve
   * @returns A promise resolving to the image result or an error
   */
  getGroupPhoto: (photoId: UUID) => Promise<Result<GetImageResult, ErrorTypes>>;

  /**
   * Performs initial setup for the file upload service.
   *
   * @returns A result indicating success or a setup error
   */
  setup: () => Result<void, SetupError>;
}
