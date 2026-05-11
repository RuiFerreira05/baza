import type { ErrorTypes } from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import type { UUID } from "crypto";
import type { Readable } from "stream";

export type Maybe<T> = T | null;

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;
export const Ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const Err = <E>(error: E): Err<E> => ({ ok: false, error });

export type GetImageResult =
  // | { type: "stream"; data: Readable; contentType: string } // alternate way for fs uploads, not currently implemented
  // | { type: "buffer"; data: Buffer; contentType: string } // used for db uploads, not currently implemented
  // | { type: "redirect"; url: string } // used for cloud uploads, not currently implemented
  | { type: "static"; filename: string }; // used for fs files

export interface FileUploadInterface {
  saveGroupPhoto: (photo: MultipartFile) => Promise<Result<UUID, ErrorTypes>>;
  getGroupPhoto: (photoId: UUID) => Promise<Result<GetImageResult, ErrorTypes>>;
}