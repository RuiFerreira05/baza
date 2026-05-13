import { fastifyMultipart } from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import { fromNodeHeaders } from "better-auth/node";
import fastify from "fastify";
import fs from "fs";
import path from "path";
import { auth } from "./lib/auth";
import { env } from "./lib/env";
import { FSUploadService } from "./lib/FSUploadService";
import { groupRoutes } from "./routes/groupRoutes";
import { userRoutes } from "./routes/profileRoutes";

// ##### APP SETUP #####

export const app = fastify({
  logger: {
    level: "info",
    file: env.LOG_FILE_PATH,
  },
});
app.setValidatorCompiler(TypeBoxValidatorCompiler);

await app.register(fastifyMultipart);

bootstrapDirs();

const fileUploadServiceMap = {
  fs: new FSUploadService(),
};

export const fileUploadService = fileUploadServiceMap[env.FILE_UPLOAD_SERVICE];
fileUploadService.setup();

// ##### SWAGGER SETUP #####

await app.register(fastifySwagger);

await app.register(fastifySwaggerUi, {
  routePrefix: "v1/docs",
});

// ##### BETTER-AUTH PROXY SETUP #####

app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = fromNodeHeaders(request.headers);

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });

      // Process authentication request
      const response = await auth.handler(req);

      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error: any) {
      app.log.error("Authentication Error:", error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

// ##### ROUTES SETUP #####

app.register(userRoutes, { prefix: "/v1/restricted/users" });
app.register(groupRoutes, { prefix: "/v1/restricted/groups" });

if (env.FILE_UPLOAD_SERVICE === "fs") {
  app.register(fastifyStatic, {
    root: path.resolve(env.UPLOAD_DIR)
    // no prefix cause we handle sending files manually
  })
}

// ####### FUNCTIONS #######

async function bootstrapDirs() {
  const logsDir = path.dirname(env.LOG_FILE_PATH);
  if (!fs.existsSync(logsDir)) {
    app.log.info(`Logs directory not found, creating at ${logsDir}`);
    fs.mkdirSync(logsDir, { recursive: true });
  }

  app.log.info("Required directories are set up");
}
