import { createStatusError, ErrorTypes } from "@baza/shared-types";
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
import { authPreHandler } from "./middlewares/authMiddleware";
import { groupRoutes } from "./routes/groupRoutes";
import { userRoutes } from "./routes/profileRoutes";

// ##### APP SETUP #####

export const app = fastify({
  logger: {
    level: "info",
    transport: {
      target: "pino-roll",
      options: {
        file: env.LOG_FILE_PATH,
        frequency: "daily",
        size: "10m",
        limit: { count: 5 },
        mkdir: true,
        dateFormat: "yyyy-MM-dd",
      },
    },
  },
});
app.setValidatorCompiler(TypeBoxValidatorCompiler);

// Register a global error handler to convert all unhandled exceptions
// into type-safe StatusError responses and bypass route serialization schemas
app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  const err = error as any;
  const statusCode = err.statusCode || 500;

  // Determine appropriate error type based on status code or validation
  let errorType = ErrorTypes.UnexpectedServerError;
  if (statusCode === 400) {
    errorType = ErrorTypes.MalformedRequestError;
  } else if (statusCode === 401) {
    errorType = ErrorTypes.UnauthorizedError;
  } else if (statusCode === 404) {
    errorType = ErrorTypes.UnknownIdError;
  }

  const errorResponse = createStatusError(
    errorType,
    err.message || "An unexpected server error occurred",
  );

  reply
    .status(statusCode)
    .header("Content-Type", "application/json; charset=utf-8")
    .send(JSON.stringify(errorResponse));
});

await app.register(fastifyMultipart);

bootstrapDirs();

const fileUploadServiceMap = {
  fs: new FSUploadService(),
};

export const fileUploadService = fileUploadServiceMap[env.FILE_UPLOAD_SERVICE];
if (!fileUploadService.setup().ok) {
  throw new Error("File upload service setup failed. Check logs for details.");
}

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
    } catch (error) {
      app.log.error(
        error instanceof Error ? error : new Error(String(error)),
        "Authentication Error:",
      );
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

// ##### ROUTES SETUP #####

app.register(
  async (restrictedApp) => {
    restrictedApp.addHook("preHandler", authPreHandler);

    await restrictedApp.register(userRoutes, { prefix: "/users" });
    await restrictedApp.register(groupRoutes, { prefix: "/groups" });
  },
  { prefix: "/v1/restricted" },
);

if (env.FILE_UPLOAD_SERVICE === "fs") {
  app.register(fastifyStatic, {
    root: path.resolve(env.UPLOAD_DIR),
    // no prefix cause we handle sending files manually
  });
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
