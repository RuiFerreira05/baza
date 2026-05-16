import { ErrorTypes } from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import fs from "fs";
import { randomUUID, type UUID } from "node:crypto";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { app } from "../setup";
import { db } from "./db";
import { env } from "./env";
import { Err, Ok, SetupError, type Failable, type FileUploadInterface, type GetImageResult, type Result } from "./types";

export class FSUploadService implements FileUploadInterface {

  static groupPhotoDir: string = path.join(env.UPLOAD_DIR, "group-photos");

  async saveGroupPhoto(
    photo: MultipartFile,
    oldPhoto: string | null,
  ): Promise<Result<UUID, ErrorTypes>> {

    const uploadDir = FSUploadService.groupPhotoDir;

    const extension = path.extname(photo.filename);

    var fileId;
    var fileName;
    var filePath;

    do {
      fileId = randomUUID();
      fileName = `${fileId}${extension}`;
      filePath = path.join(uploadDir, fileName);
    } while (fs.existsSync(filePath));

    const dirname = path.dirname(filePath);

    if (!fs.existsSync(dirname)) {
      app.log.info(`Group photos upload directory not found, creating at ${dirname}`);
      fs.mkdirSync(dirname, { recursive: true });
    }

    try {
      await pipeline(photo.file, fs.createWriteStream(filePath));
      if (oldPhoto) {
        app.log.info(`Removing old photo with id ${oldPhoto}`);
        fs.rmSync(path.join(uploadDir, `${oldPhoto}${extension}`), { force: true });
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
    app.log.debug(`Looking for photo with id ${groupPhotoId.photo} in directory ${uploadDir}`);
    app.log.debug(`Files in directory: ${files.join(", ")}`);
    const fileName = files.find(file => path.parse(file).name === groupPhotoId.photo);
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
      app.log.info(`Group photos upload directory not found, creating at ${FSUploadService.groupPhotoDir}`);
      fs.mkdirSync(FSUploadService.groupPhotoDir, { recursive: true })
    }
    return Ok(undefined);
  }
}
