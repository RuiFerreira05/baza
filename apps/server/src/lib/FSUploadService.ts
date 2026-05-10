import { ErrorTypes } from "@baza/shared-types";
import type { MultipartFile } from "@fastify/multipart";
import { randomUUID, type UUID } from "node:crypto";
import { Err, Ok, type fileUploadInterface, type Result } from "./types";
import { env } from "./env";
import path from "node:path";
import fs from "fs";
import { pipeline } from "node:stream/promises";
import { app } from "../setup";

export class FSUploadService implements fileUploadInterface {
  async saveGroupPhoto(
    photo: MultipartFile,
  ): Promise<Result<UUID, ErrorTypes>> {

    const uploadDir = path.join(env.UPLOAD_DIR, "group-photos");
    
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
      return Ok(fileId);
    } catch (error) {
      app.log.error(`Failed to save group photo: ${(error as Error).message}`);
      return Err(ErrorTypes.ResourceCreationError);
    }
  }
}