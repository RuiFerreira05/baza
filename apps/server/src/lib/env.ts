import Type from "typebox";
import { Settings } from "typebox/system";
import Value from "typebox/value";

Settings.Set({
  correctiveParse: true,
});

const serverEnvSchema = Type.Object({
  DATABASE_URL: Type.String(),
  SERVER_PORT: Type.String(),
  SERVER_HOST: Type.String(),
  BETTER_AUTH_SECRET: Type.String(),
  PUBLIC_SERVER_URL: Type.String(),
  LOG_FILE_PATH: Type.String(),
  FILE_UPLOAD_SERVICE: Type.Union([Type.Literal("fs")]),
  UPLOAD_DIR: Type.String(),
});

export type ServerEnv = Type.Static<typeof serverEnvSchema>;

var env: ServerEnv;

try {
  env = Value.Parse(serverEnvSchema, process.env);
} catch (err) {
  console.error("Environment variable validation error:", Value.Errors(serverEnvSchema, err));
  process.exit(1);
}

export { env };
