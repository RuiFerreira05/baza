import {
  BlockUserBody,
  createStatusError,
  createStatusOK,
  ErrorTypes,
  RespondFriendRequestBody,
  type SendFriendRequestBody,
  type SimpleUsernameParam,
} from "@baza/shared-types";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  acceptFriendRequest,
  blockUser,
  declineFriendRequest,
  getFriendProfile,
  getFriends,
  getPendingFriendRequests,
  getPendingSentFriendRequests,
  removeFriend,
  sendFriendRequest,
  unblockUser,
} from "../services/profileServices";
import { app } from "../setup";

// GET /users/:username/friends
export const getFriendsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get user's friends list request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getFriends(username);

  if (!result.ok) {
    return res
      .status(500)
      .send(
        createStatusError(
          ErrorTypes.ConversionError,
          "An error occurred while converting the friends data",
        ),
      );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/friends/:friendUsername
export const getFriendProfileHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get user's friend profile request");
  const { username } = req.params as SimpleUsernameParam;
  const { friendUsername } = req.params as { friendUsername: string };

  const result = await getFriendProfile(username, friendUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "Friend profile not found, or users are not friends.",
            ),
          );
      case ErrorTypes.ConversionError:
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert friend profile data.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /users/:username/friends/:friendUsername/remove
export const removeFriendHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received remove friend request");
  const { username } = req.params as SimpleUsernameParam;
  const { friendUsername } = req.params as { friendUsername: string };

  const result = await removeFriend(username, friendUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "Friendship record not found.",
            ),
          );
      case ErrorTypes.DeleteError:
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.DeleteError,
              "An error occurred while removing the friend.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /users/:username/friends/sendRequest
export const sendFriendRequestHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received send friend request");
  const { username } = req.params as SimpleUsernameParam;
  const { recipientUsername } = req.body as SendFriendRequestBody;

  const result = await sendFriendRequest(username, recipientUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "Recipient profile not found.",
            ),
          );
      case ErrorTypes.ExistingResourceError:
        return res
          .status(400)
          .send(
            createStatusError(
              ErrorTypes.ExistingResourceError,
              "Friend request already pending or accepted.",
            ),
          );
      case ErrorTypes.MalformedRequestError:
        return res
          .status(400)
          .send(
            createStatusError(
              ErrorTypes.MalformedRequestError,
              "You cannot send a friend request to yourself or request is blocked.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.MalformedRequestError,
              "An error occurred while sending friend request.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/friends/requests
export const getPendingFriendRequestsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get pending friend requests request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getPendingFriendRequests(username);

  if (!result.ok) {
    return res
      .status(500)
      .send(
        createStatusError(
          ErrorTypes.ConversionError,
          "Failed to convert pending requests data.",
        ),
      );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// PATCH /users/:username/friends/requests/:senderUsername
export const respondFriendRequestHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received respond friend request");
  const { username } = req.params as SimpleUsernameParam;
  const { senderUsername } = req.params as { senderUsername: string };
  const { status } = req.body as RespondFriendRequestBody;

  if (status === "accepted") {
    const result = await acceptFriendRequest(username, senderUsername);
    if (!result.ok) {
      switch (result.error) {
        case ErrorTypes.UnknownUsernameError:
          return res
            .status(404)
            .send(
              createStatusError(
                ErrorTypes.UnknownUsernameError,
                "Pending friend request not found.",
              ),
            );
        case ErrorTypes.UpdateError:
        default:
          return res
            .status(500)
            .send(
              createStatusError(
                ErrorTypes.UpdateError,
                "Failed to accept friend request.",
              ),
            );
      }
    } else {
      return res.status(200).send(createStatusOK(result.value));
    }
  } else {
    const result = await declineFriendRequest(username, senderUsername);
    if (!result.ok) {
      switch (result.error) {
        case ErrorTypes.UnknownUsernameError:
          return res
            .status(404)
            .send(
              createStatusError(
                ErrorTypes.UnknownUsernameError,
                "Pending friend request not found.",
              ),
            );
        case ErrorTypes.UpdateError:
        default:
          return res
            .status(500)
            .send(
              createStatusError(
                ErrorTypes.UpdateError,
                "Failed to decline friend request.",
              ),
            );
      }
    } else {
      return res.status(200).send(createStatusOK(result.value));
    }
  }
};

// POST /users/:username/blocks
export const blockUserHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received block user request");
  const { username } = req.params as SimpleUsernameParam;
  const { blockedUsername } = req.body as BlockUserBody;

  const result = await blockUser(username, blockedUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "User to block not found.",
            ),
          );
      case ErrorTypes.UpdateError:
      default:
        return res
          .status(500)
          .send(
            createStatusError(ErrorTypes.UpdateError, "Failed to block user."),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// DELETE /users/:username/blocks/:blockedUsername
export const unblockUserHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received unblock user request");
  const { username } = req.params as SimpleUsernameParam;
  const { blockedUsername } = req.params as { blockedUsername: string };

  const result = await unblockUser(username, blockedUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "Blocked relationship not found.",
            ),
          );
      case ErrorTypes.DeleteError:
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.DeleteError,
              "Failed to unblock user.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/friends/requests/sent
export const getPendingSentFriendRequestsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get pending sent friend requests request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getPendingSentFriendRequests(username);

  if (!result.ok) {
    return res
      .status(500)
      .send(
        createStatusError(
          ErrorTypes.ConversionError,
          "Failed to convert pending sent requests data.",
        ),
      );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/friendsNumber
export const getFriendsNumberHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get user's number of friends request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getFriends(username);

  if (!result.ok) {
    return res
      .status(500)
      .send(
        createStatusError(
          ErrorTypes.ConversionError,
          "An error occurred while converting the friends data",
        ),
      );
  } else {
    const numberFriends = result.value.length;
    return res.status(200).send(createStatusOK(numberFriends));
  }
};
