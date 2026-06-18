import type { FastifyReply, FastifyRequest } from "fastify";
import {
  getUserGroups,
  getUserGroupById,
  getUserGroupInvites,
  acceptGroupInvite,
  declineGroupInvite,
} from "../services/profileServices";
import {
  createStatusError,
  createStatusOK,
  ErrorTypes,
  type SimpleUsernameParam,
  RespondGroupInviteBody,
} from "@baza/shared-types";
import { app } from "../setup";

// GET /users/:username/groups
export const getUserGroupsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get user's groups request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getUserGroups(username);

  if (!result.ok) {
    return res
      .status(500)
      .send(
        createStatusError(
          ErrorTypes.ConversionError,
          "Failed to retrieve groups list.",
        ),
      );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/groups/:idGroup
export const getUserGroupByIdHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get user's group by ID request");
  const { username } = req.params as SimpleUsernameParam;
  const { idGroup: groupId } = req.params as { idGroup: string };

  const result = await getUserGroupById(username, groupId);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "Group not found or user is not a member.",
            ),
          );
      case ErrorTypes.ConversionError:
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert group data.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/groups/invites
export const getUserGroupInvitesHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get user's group invites request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getUserGroupInvites(username);

  if (!result.ok) {
    return res
      .status(500)
      .send(
        createStatusError(
          ErrorTypes.ConversionError,
          "Failed to retrieve invitations list.",
        ),
      );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// PATCH /users/:username/groups/invites/:groupId
export const respondGroupInviteHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received respond group invite request");
  const { username } = req.params as SimpleUsernameParam;
  const { groupId } = req.params as { groupId: string };
  const { status } = req.body as RespondGroupInviteBody;

  if (status === "accepted") {
    const result = await acceptGroupInvite(username, groupId);
    if (!result.ok) {
      switch (result.error) {
        case ErrorTypes.UnknownIdError:
          return res
            .status(404)
            .send(
              createStatusError(
                ErrorTypes.UnknownIdError,
                "Group invitation not found.",
              ),
            );
        case ErrorTypes.UpdateError:
        default:
          return res
            .status(500)
            .send(
              createStatusError(
                ErrorTypes.UpdateError,
                "Failed to accept group invitation.",
              ),
            );
      }
    } else {
      return res.status(200).send(createStatusOK(result.value));
    }
  } else {
    const result = await declineGroupInvite(username, groupId);
    if (!result.ok) {
      switch (result.error) {
        case ErrorTypes.UnknownIdError:
          return res
            .status(404)
            .send(
              createStatusError(
                ErrorTypes.UnknownIdError,
                "Group invitation not found.",
              ),
            );
        case ErrorTypes.DeleteError:
        default:
          return res
            .status(500)
            .send(
              createStatusError(
                ErrorTypes.DeleteError,
                "Failed to decline group invitation.",
              ),
            );
      }
    } else {
      return res.status(200).send(createStatusOK(result.value));
    }
  }
};
