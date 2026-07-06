import Type from "typebox";
import { Settings } from "typebox/system";
import Value from "typebox/value";

Settings.Set({
  correctiveParse: true,
});

const serverEnvSchema = Type.Object({
  SERVER_PORT: Type.String({
    description: "The port number the server will listen on",
    pattern: "^[0-9]+$",
    default: "8080",
  }),
  SERVER_HOST: Type.String({
    description: "The host the server will bind to",
    default: "0.0.0.0",
  }),
  PUBLIC_SERVER_URL: Type.String({
    description:
      "The public URL of the server, used for generating links in emails",
    format: "uri",
  }),
  DATABASE_URL: Type.String({
    description:
      "The connection string for the database, in the format postgres://user:password@host:port/database",
    format: "uri",
  }),
  BETTER_AUTH_SECRET: Type.String({
    description: "A random string used to sign authentication tokens",
  }),
  LOG_FILE_PATH: Type.String({
    description: "The file path where server logs will be written",
    default: "./logs/server.log",
  }),
  AUDIT_LOG_FILE_PATH: Type.String({
    description: "The file path where audit logs will be written",
    default: "./logs/audit.log",
  }),
  FILE_UPLOAD_SERVICE: Type.Union([Type.Literal("fs")], {
    description: "The file upload service to use for handling file uploads",
    default: "fs",
  }),
  UPLOAD_DIR: Type.String({
    description:
      "The directory where uploaded files will be stored (used only if FILE_UPLOAD_SERVICE is 'fs')",
    default: "./uploads/",
  }),
  BYPASS_AUTH: Type.Optional(
    Type.String({
      description: "Bypass authentication checks in development/testing mode",
      default: "false",
    }),
  ),
  GOOGLE_CLIENT_ID: Type.Optional(
    Type.String({
      description: "Google Client ID for OAuth login",
    }),
  ),
  GOOGLE_CLIENT_SECRET: Type.Optional(
    Type.String({
      description: "Google Client Secret for OAuth login",
    }),
  ),
});

export type ServerEnv = Type.Static<typeof serverEnvSchema>;

let env: ServerEnv;

try {
  const rawEnv = { ...process.env };
  Value.Default(serverEnvSchema, rawEnv);
  env = Value.Parse(serverEnvSchema, rawEnv);
} catch (err) {
  console.error(
    "Environment variable validation error:\n",
    Value.Errors(serverEnvSchema, err),
  );
  process.exit(1);
}

export { env };
