import type { FastifyReply, FastifyRequest } from "fastify";
import {
  getFriends,
  getFriendProfile,
  removeFriend,
  sendFriendRequest,
  getPendingFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from "../services/profileServices";
import {
  createStatusError,
  createStatusOK,
  ErrorTypes,
  type SimpleUsernameParam,
  type SendFriendRequestBody,
} from "@baza/shared-types";
import { app } from "../setup";

// GET /users/:username/friends
export const getFriendsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received get user's friends list request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getFriends(username);

  if (!result.ok) {
    return res.status(500).send(
      createStatusError(
        ErrorTypes.ConversionError,
        "An error occurred while converting the friends data"
      )
    );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/friends/:friendUsername
export const getFriendProfileHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received get user's friend profile request");
  const { username } = req.params as SimpleUsernameParam;
  const { friendUsername } = req.params as { friendUsername: string };

  const result = await getFriendProfile(username, friendUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "Friend profile not found, or users are not friends."
          )
        );
      case ErrorTypes.ConversionError:
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.ConversionError,
            "Failed to convert friend profile data."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /users/:username/friends/:friendUsername/remove
export const removeFriendHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received remove friend request");
  const { username } = req.params as SimpleUsernameParam;
  const { friendUsername } = req.params as { friendUsername: string };

  const result = await removeFriend(username, friendUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "Friendship record not found."
          )
        );
      case ErrorTypes.DeleteError:
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.DeleteError,
            "An error occurred while removing the friend."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /users/:username/friends/sendRequest
export const sendFriendRequestHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received send friend request");
  const { username } = req.params as SimpleUsernameParam;
  const { recipientUsername } = req.body as SendFriendRequestBody;

  const result = await sendFriendRequest(username, recipientUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "Recipient profile not found."
          )
        );
      case ErrorTypes.ExistingResourceError:
        return res.status(400).send(
          createStatusError(
            ErrorTypes.ExistingResourceError,
            "Friend request already pending or accepted."
          )
        );
      case ErrorTypes.MalformedRequestError:
        return res.status(400).send(
          createStatusError(
            ErrorTypes.MalformedRequestError,
            "You cannot send a friend request to yourself or request is blocked."
          )
        );
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.MalformedRequestError,
            "An error occurred while sending friend request."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/friends/requests
export const getPendingFriendRequestsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received get pending friend requests request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getPendingFriendRequests(username);

  if (!result.ok) {
    return res.status(500).send(
      createStatusError(
        ErrorTypes.ConversionError,
        "Failed to convert pending requests data."
      )
    );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /users/:username/friends/requests/:senderUsername/accept
export const acceptFriendRequestHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received accept friend request");
  const { username } = req.params as SimpleUsernameParam;
  const { senderUsername } = req.params as { senderUsername: string };

  const result = await acceptFriendRequest(username, senderUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "Pending friend request not found."
          )
        );
      case ErrorTypes.UpdateError:
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.UpdateError,
            "Failed to accept friend request."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /users/:username/friends/requests/:senderUsername/decline
export const declineFriendRequestHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received decline friend request");
  const { username } = req.params as SimpleUsernameParam;
  const { senderUsername } = req.params as { senderUsername: string };

  const result = await declineFriendRequest(username, senderUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "Pending friend request not found."
          )
        );
      case ErrorTypes.UpdateError:
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.UpdateError,
            "Failed to decline friend request."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};
