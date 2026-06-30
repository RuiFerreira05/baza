import {
  Err,
  ErrorTypes,
  Ok,
  type Failable,
  type Result,
} from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import fs from "fs";
import { randomUUID, type UUID } from "node:crypto";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { app } from "../setup";
import { db } from "./db";
import { env } from "./env";
import {
  SetupError,
  type FileUploadInterface,
  type GetImageResult,
} from "./types";

export class FSUploadService implements FileUploadInterface {
  static groupPhotoDir: string = path.join(env.UPLOAD_DIR, "group-photos");
  static profilePhotoDir: string = path.join(env.UPLOAD_DIR, "user-photos");

  async saveGroupPhoto(
    photo: MultipartFile,
    oldPhoto: string | null,
  ): Promise<Result<UUID, ErrorTypes>> {
    const uploadDir = FSUploadService.groupPhotoDir;

    const extension = path.extname(photo.filename);

    let fileId;
    let fileName;
    let filePath;

    do {
      fileId = randomUUID();
      fileName = `${fileId}${extension}`;
      filePath = path.join(uploadDir, fileName);
    } while (fs.existsSync(filePath));

    const dirname = path.dirname(filePath);

    if (!fs.existsSync(dirname)) {
      app.log.info(
        `Group photos upload directory not found, creating at ${dirname}`,
      );
      fs.mkdirSync(dirname, { recursive: true });
    }

    try {
      await pipeline(photo.file, fs.createWriteStream(filePath));
      if (oldPhoto) {
        app.log.info(`Removing old photo with id ${oldPhoto}`);
        fs.rmSync(path.join(uploadDir, `${oldPhoto}${extension}`), {
          force: true,
        });
      }
      return Ok(fileId);
    } catch (error) {
      app.log.error(`Failed to save group photo: ${(error as Error).message}`);
      return Err(ErrorTypes.ResourceCreationError);
    }
  }

  async getGroupPhoto(
    groupId: string,
  ): Promise<Result<GetImageResult, ErrorTypes>> {
    const groupPhotoId = await db.query.groups.findFirst({
      where: {
        id: groupId,
      },
      columns: {
        photo: true,
      },
    });

    if (!groupPhotoId) {
      app.log.warn(`Group with id ${groupId} not found`);
      return Err(ErrorTypes.UnknownIdError);
    }

    if (!groupPhotoId.photo) {
      app.log.warn(`Group with id ${groupId} does not have a photo`);
      return Err(ErrorTypes.UnknownIdError);
    }

    const uploadDir = FSUploadService.groupPhotoDir;
    const files = fs.readdirSync(uploadDir);
    app.log.debug(
      `Looking for photo with id ${groupPhotoId.photo} in directory ${uploadDir}`,
    );
    app.log.debug(`Files in directory: ${files.join(", ")}`);
    const fileName = files.find(
      (file) => path.parse(file).name === groupPhotoId.photo,
    );
    if (!fileName) {
      return Err(ErrorTypes.UnknownIdError);
    }
    return Ok({
      type: "static",
      filename: fileName,
    });
  }

  setup(): Failable<SetupError> {
    if (!fs.existsSync(FSUploadService.groupPhotoDir)) {
      app.log.info(
        `Group photos upload directory not found, creating at ${FSUploadService.groupPhotoDir}`,
      );
      fs.mkdirSync(FSUploadService.groupPhotoDir, { recursive: true });
    }
    if (!fs.existsSync(FSUploadService.profilePhotoDir)) {
      app.log.info(
        `Profile photos upload directory not found, creating at ${FSUploadService.profilePhotoDir}`,
      );
      fs.mkdirSync(FSUploadService.profilePhotoDir, { recursive: true });
    }
    return Ok(undefined);
  }

  async saveProfilePhoto(
    photo: MultipartFile,
    oldPhoto: string | null,
  ): Promise<Result<UUID, ErrorTypes>> {
    const uploadDir = FSUploadService.profilePhotoDir;

    const extension = path.extname(photo.filename);

    let fileId;
    let fileName;
    let filePath;

    do {
      fileId = randomUUID();
      fileName = `${fileId}${extension}`;
      filePath = path.join(uploadDir, fileName);
    } while (fs.existsSync(filePath));

    const dirname = path.dirname(filePath);

    if (!fs.existsSync(dirname)) {
      app.log.info(
        `Profile photos upload directory not found, creating at ${dirname}`,
      );
      fs.mkdirSync(dirname, { recursive: true });
    }

    try {
      await pipeline(photo.file, fs.createWriteStream(filePath));
      if (oldPhoto) {
        app.log.info(`Removing old photo with id ${oldPhoto}`);
        fs.rmSync(path.join(uploadDir, `${oldPhoto}${extension}`), {
          force: true,
        });
      }
      return Ok(fileId);
    } catch (error) {
      app.log.error(
        `Failed to save profile photo: ${(error as Error).message}`,
      );
      return Err(ErrorTypes.ResourceCreationError);
    }
  }

  async getProfilePhoto(
    username: string,
  ): Promise<Result<GetImageResult, ErrorTypes>> {
    const profilePhotoId = await db.query.profiles.findFirst({
      where: {
        username: username,
      },
      columns: {
        photo: true,
      },
    });

    if (!profilePhotoId) {
      app.log.warn(`Profile with username ${username} not found`);
      return Err(ErrorTypes.UnknownUsernameError);
    }

    if (!profilePhotoId.photo) {
      app.log.warn(`Profile with username ${username} does not have a photo`);
      return Err(ErrorTypes.UnknownUsernameError);
    }

    const uploadDir = FSUploadService.profilePhotoDir;
    const files = fs.readdirSync(uploadDir);
    app.log.debug(
      `Looking for photo with id ${profilePhotoId.photo} in directory ${uploadDir}`,
    );
    app.log.debug(`Files in directory: ${files.join(", ")}`);
    const fileName = files.find(
      (file) => path.parse(file).name === profilePhotoId.photo,
    );
    if (!fileName) {
      return Err(ErrorTypes.UnknownUsernameError);
    }
    return Ok({
      type: "static",
      filename: fileName,
    });
  }
}
