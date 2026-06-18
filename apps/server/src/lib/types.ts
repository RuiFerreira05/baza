import type { ErrorTypes } from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import type { UUID } from "crypto";

import { type Result } from "@baza/shared-types";

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
