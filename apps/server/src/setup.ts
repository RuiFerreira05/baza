import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import { fromNodeHeaders } from "better-auth/node";
import fastify from "fastify";
import { auth } from "./lib/auth";
import { userRoutes } from "./routes/profileRoutes";
import { groupRoutes } from "./routes/groupRoutes";
import fs from "fs";

if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

export const app = fastify({
  logger: {
    level: "info",
    file: "./logs/server.log",
  },
});
app.setValidatorCompiler(TypeBoxValidatorCompiler);

await app.register(fastifySwagger);

await app.register(fastifySwaggerUi, {
  routePrefix: "v1/docs",
});

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

app.register(userRoutes, { prefix: "/v1/restricted/users/" });
app.register(groupRoutes, { prefix: "/v1/restricted/groups/" });
