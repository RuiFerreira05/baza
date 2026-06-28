import * as schema from "@baza/db/schemas";
import { profiles } from "@baza/db/schemas";
import { createStatusError, ErrorTypes } from "@baza/shared-types";
import { expo } from "@better-auth/expo";
import type { Session, User } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { fromNodeHeaders } from "better-auth/node";
import { openAPI } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "./db";
import { env } from "./env";

export const auth = betterAuth({
  trustedOrigins: ["baza://", `http://10.0.2.2:${env.SERVER_PORT}`], // 10.0.2.2 is the special IP for localhost in Android emulators
  plugins: [expo(), openAPI()],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.PUBLIC_SERVER_URL,
});

declare module "fastify" {
  interface FastifyRequest {
    session?: {
      session: Session;
      user: User;
    } | null;
    username?: string;
  }
}

export const getAuthenticatedUsername = async (
  req: FastifyRequest,
  res: FastifyReply,
): Promise<string | null> => {
  if (req.username) {
    return req.username;
  }
  try {
    const session =
      req.session !== undefined
        ? req.session
        : await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
          });

    if (!session || !session.user) {
      res
        .status(401)
        .send(
          createStatusError(
            ErrorTypes.UnauthorizedError,
            "Unauthorized request. Session not found.",
          ),
        );
      return null;
    }

    req.session = session;

    const [profile] = await db
      .select({ username: profiles.username })
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!profile) {
      res
        .status(404)
        .send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "User profile not found. Please create a profile first.",
          ),
        );
      return null;
    }

    req.username = profile.username;
    return profile.username;
  } catch (error) {
    req.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Authentication check failed",
    );
    res
      .status(500)
      .send(
        createStatusError(
          ErrorTypes.UnauthorizedError,
          "An internal authentication error occurred.",
        ),
      );
    return null;
  }
};
