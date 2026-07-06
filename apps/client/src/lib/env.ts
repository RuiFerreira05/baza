import Type from "typebox";
import { Settings } from "typebox/system";
import Value from "typebox/value";

Settings.Set({
  correctiveParse: true,
});

const serverEnvSchema = Type.Object({
  EXPO_PUBLIC_SERVER_URL: Type.String(),
  EXPO_PUBLIC_BYPASS_AUTH: Type.String(),
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: Type.Optional(Type.String()),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: Type.Optional(Type.String()),
});

export type ServerEnv = Type.Static<typeof serverEnvSchema>;

// Clone process.env to avoid mutating the read-only global object
const rawEnv = { ...process.env };
Value.Default(serverEnvSchema, rawEnv);

export const env: ServerEnv = Value.Parse(serverEnvSchema, rawEnv);
