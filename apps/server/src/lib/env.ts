import Type from "typebox";
import Value from "typebox/value";

const serverEnvSchema = Type.Object({
  DATABASE_URL: Type.String(),
  SERVER_PORT: Type.String(),
  SERVER_HOST: Type.String(),
  BETTER_AUTH_SECRET: Type.String(),
  PUBLIC_SERVER_URL: Type.String(),
});

export type ServerEnv = Type.Static<typeof serverEnvSchema>;

export const env: ServerEnv = Value.Parse(serverEnvSchema, process.env);