import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { env } from "./env";
import { expo } from "@better-auth/expo";
import * as schema from "@baza/db/schemas";

export const auth = betterAuth({
  trustedOrigins: ["baza://", `http://10.0.2.2:${env.SERVER_PORT}`], // 10.0.2.2 is the special IP for localhost in Android emulators
  plugins: [expo()],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.PUBLIC_SERVER_URL,
});
