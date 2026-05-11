// apps/server/src/server.ts
import "dotenv/config";
import { env } from "./lib/env";
import { app } from "./setup";
import { FSUploadService } from "./lib/FSUploadService";

const fileUploadServiceMap = {
  fs: new FSUploadService(),
};

export const fileUploadService = fileUploadServiceMap[env.FILE_UPLOAD_SERVICE];

app.listen({ port: parseInt(env.SERVER_PORT), host: env.SERVER_HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log("Server running on http://localhost:" + env.SERVER_PORT);
});