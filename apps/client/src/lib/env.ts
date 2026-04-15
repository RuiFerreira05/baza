import Type from "typebox";
import Value from "typebox/value";

const serverEnvSchema = Type.Object({
  EXPO_PUBLIC_SERVER_URL: Type.String(),
});

export type ServerEnv = Type.Static<typeof serverEnvSchema>;

export const env: ServerEnv = Value.Parse(serverEnvSchema, process.env);
