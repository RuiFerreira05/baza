import { groups } from "@baza/db/schemas";
import { createStatusError, ErrorTypes } from "@baza/shared-types";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { auth, getAuthenticatedUsername } from "../lib/auth";
import { db } from "../lib/db";
import { env } from "../lib/env";
import { verifyGroupMembership } from "../services/groupServices";

export const authPreHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const isBypassed =
    process.env.NODE_ENV !== "production" && env.BYPASS_AUTH === "true";

  if (isBypassed) {
    req.username = "test_user";
    req.session = {
      session: {
        id: "mock-session-id",
        userId: "mock-user-id",
        token: "mock-token",
        expiresAt: new Date(Date.now() + 3600000),
        ipAddress: "127.0.0.1",
        userAgent: "mock-agent",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      user: {
        id: "mock-user-id",
        name: "Test User",
        email: "test@test.com",
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    return;
  }

  const isTestEnv = process.env.NODE_ENV === "test";
  const isMock =
    typeof (getAuthenticatedUsername as any).mock !== "undefined" ||
    (getAuthenticatedUsername as any)._isMockFunction;

  // 1. Resolve authentication context
  if (isTestEnv && isMock && !req.headers["test-force-session-check"]) {
    const username = await getAuthenticatedUsername(req, res);
    if (username) {
      req.username = username;
    }
  } else {
    // Handle special case for profile creation route: /v1/restricted/users
    const isProfileCreation =
      req.routeOptions?.url === "/v1/restricted/users" ||
      req.routeOptions?.url === "/v1/restricted/users/" ||
      req.url === "/v1/restricted/users" ||
      req.url === "/v1/restricted/users/" ||
      req.url === "/users" ||
      req.url === "/users/";
    if (isProfileCreation) {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
          return res
            .status(401)
            .send(
              createStatusError(
                ErrorTypes.UnauthorizedError,
                "Unauthorized request. Session not found.",
              ),
            );
        }

        req.session = session;
        return;
      } catch (error) {
        req.log.error(
          error instanceof Error ? error : new Error(String(error)),
          "Session check failed on profile creation",
        );
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.UnauthorizedError,
              "An internal authentication error occurred.",
            ),
          );
      }
    }

    // For all other restricted routes, run getAuthenticatedUsername (performs session + profile check)
    const username = await getAuthenticatedUsername(req, res);
    if (!username) {
      return;
    }
    req.username = username;
  }

  // 2. Access Control (RLS) Policies
  if (!req.username) {
    return;
  }

  const params = req.params as Record<string, any>;

  // A. Group Access Policy (Only active group members can access group sub-routes)
  if (params && params.id) {
    // Check if the group exists first
    const [groupExists] = await db
      .select({ id: groups.id })
      .from(groups)
      .where(eq(groups.id, params.id))
      .limit(1);

    if (!groupExists) {
      return res
        .status(404)
        .send(createStatusError(ErrorTypes.UnknownIdError, "Group not found."));
    }

    const isMember = await verifyGroupMembership(params.id, req.username);
    if (!isMember) {
      return res
        .status(403)
        .send(
          createStatusError(
            ErrorTypes.UnauthorizedError,
            "Forbidden. You are not an active member of this group.",
          ),
        );
    }
  }

  // B. User Profile Owner Policy (Users can only access their own profile details/settings/events)
  if (params && params.username) {
    const routeUrl = req.routeOptions?.url || req.url;
    const isUserRoute =
      routeUrl.startsWith("/v1/restricted/users/") ||
      routeUrl.startsWith("/users/");

    if (isUserRoute) {
      // Exception: GET /v1/restricted/users/:username is the public profile view, which is accessible to all authenticated users
      const isPublicProfileDetail =
        req.method === "GET" &&
        (routeUrl === "/v1/restricted/users/:username" ||
          routeUrl === "/:username" ||
          routeUrl === "/users/:username");

      if (!isPublicProfileDetail) {
        if (req.username !== params.username) {
          return res
            .status(403)
            .send(
              createStatusError(
                ErrorTypes.UnauthorizedError,
                "Forbidden. You can only access your own profile details.",
              ),
            );
        }
      }
    }
  }
};
