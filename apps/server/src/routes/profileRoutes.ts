import {
  profileDTO,
  CreateProfileBody,
  EditProfileBody,
  ErrorTypes,
  StatusOK,
  StatusError,
  SimpleUsernameParam,
  GetPersonalEventsParams,
  personalEventDTO,
  CreatePersonalEventBody,
  EditPersonalEventBody,
  groupDTO,
  groupMemberDTO,
  SendFriendRequestBody,
  FriendRequestDTO,
  SentFriendRequestDTO,
} from "@baza/shared-types";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import { getUserByUsernameHandler, createUserProfileHandler, deleteUserProfileHandler, editUserProfileHandler } from "../handlers/profileHandlers";
import {
  getPersonalEventsHandler,
  getPersonalEventByIdHandler,
  createPersonalEventHandler,
  editPersonalEventHandler
} from "../handlers/eventHandlers";
import {
  getFriendsHandler,
  getFriendProfileHandler,
  removeFriendHandler,
  sendFriendRequestHandler,
  getPendingFriendRequestsHandler,
  acceptFriendRequestHandler,
  declineFriendRequestHandler,
  blockUserHandler,
  unblockUserHandler,
  getPendingSentFriendRequestsHandler,
} from "../handlers/friendHandlers";
import {
  getUserSettingsHandler,
  updateUserSettingsHandler
} from "../handlers/settingsHandlers";
import {
  getUserGroupsHandler,
  getUserGroupByIdHandler,
  getUserGroupInvitesHandler,
  acceptGroupInviteHandler,
  declineGroupInviteHandler
} from "../handlers/userGroupHandlers";
import Type from "typebox";

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // GET /users/:username
  app.get(
    "/:username",
    {
      schema: {
        description: "This route fetches profile information from a user of the app",
        tags: ["users"],
        response: {
          200: StatusOK(
            profileDTO,
            "if the profile information was successfully fetched and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownUsernameError,
            "if no profile from user with the provided username was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the profile data to the expected format before sending the response",
          ),
        },
        params: SimpleUsernameParam("Username of a user of the aplication whose profile is being fetched"),
      },
    },
    getUserByUsernameHandler
  );

  // DELETE /users/create
  app.post(
    "/create",
    {
      schema: {
        description: "This route creates a profile for a user of the app",
        tags: ["users"],
        body: CreateProfileBody,
        response: {
          200: StatusOK(
            profileDTO,
            "if the profile was successfully created and converted to the expected format before sending the response",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if the profile was created but there was an error converting it to the expected format before sending the response",
          ),
        },
      },
    },
    createUserProfileHandler
  );

  // DELETE /users/:username/delete
  app.delete(
    "/:username/delete",
    {
      schema: {
        description: "This route deletes a user's profile",
        tags: ["users"],
        params: SimpleUsernameParam("The username of the user whose profile is being deleted"),
        response: {
          200: StatusOK(
            profileDTO,
            "if the profile was successfully deleted",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no user with the provided username was found",
          ),
          500: StatusError(
            ErrorTypes.DeleteError,
            "if there was an error deleting the profile",
          ),
        },
      },
    },
    deleteUserProfileHandler
  );

  // PATCH /users/:username/edit
  app.patch(
    "/:username/edit",
    {
      schema: {
        description: "This route edits a user's profile information (except photo and settings)",
        tags: ["users"],
        params: SimpleUsernameParam("The username of the user whose profile is being edited"),
        body: EditProfileBody,
        response: {
          200: StatusOK(
            profileDTO,
            "if the profile information was successfully updated and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownIdError,
            "if no user with the provided username was found",
          ),
          500: StatusError(
            ErrorTypes.DeleteError,
            "if there was an error converting the updated profile data to the expected format before sending the response",
          ),
        },
      },
    },
    editUserProfileHandler
  );

  // GET /users/:username/events?startDate,endDate
  app.get(
    "/:username/events",
    {
      schema: {
        description: "This route fetches all events, in the given time period, from a user calendar.",
        tags: ["users"],
        params: SimpleUsernameParam("The username of the user whose events are being fetched"),
        querystring: GetPersonalEventsParams,
        response: {
          200: StatusOK(
            Type.Array(personalEventDTO),
            "if the events' information was successfully fetched and converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownUsernameError,
            "if no personal events from the user with the provided username was found",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if there was an error converting the events' data to the expected format before sending the response",
          ),
        },
      },
    },
    getPersonalEventsHandler
  );

  // GET /users/:username/events/:idEvent
  app.get(
    "/:username/events/:idEvent",
    {
      schema: {
        description: "This route fetches a single personal event by username and event ID.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          idEvent: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(personalEventDTO, "Success"),
          404: StatusError(ErrorTypes.UnknownIdError, "Not found"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getPersonalEventByIdHandler
  );

  // POST /users/:username/events/create
  app.post(
    "/:username/events/create",
    {
      schema: {
        description: "This route creates a new personal event.",
        tags: ["users"],
        params: SimpleUsernameParam("The username of the user creating the event"),
        body: CreatePersonalEventBody,
        response: {
          201: StatusOK(personalEventDTO, "Created"),
          400: StatusError(ErrorTypes.MalformedRequestError, "Bad request"),
          500: StatusError(ErrorTypes.ResourceCreationError, "Error"),
        },
      },
    },
    createPersonalEventHandler
  );

  // PATCH /users/:username/events/:idEvent/edit
  app.patch(
    "/:username/events/:idEvent/edit",
    {
      schema: {
        description: "This route edits an existing personal event.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          idEvent: Type.String({ format: "uuid" }),
        }),
        body: EditPersonalEventBody,
        response: {
          200: StatusOK(personalEventDTO, "Updated"),
          400: StatusError(ErrorTypes.MalformedRequestError, "Bad request"),
          404: StatusError(ErrorTypes.UnknownIdError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    editPersonalEventHandler
  );

  // GET /users/:username/groups
  app.get(
    "/:username/groups",
    {
      schema: {
        description: "This route fetches all groups that the user is an active member of.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        response: {
          200: StatusOK(Type.Array(groupDTO), "Success"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getUserGroupsHandler
  );

  // GET /users/:username/groups/invites
  app.get(
    "/:username/groups/invites",
    {
      schema: {
        description: "This route fetches pending group invites for the user.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        response: {
          200: StatusOK(Type.Array(groupDTO), "Success"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getUserGroupInvitesHandler
  );

  // POST /users/:username/groups/invites/:groupId/accept
  app.post(
    "/:username/groups/invites/:groupId/accept",
    {
      schema: {
        description: "This route accepts a group invitation.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          groupId: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(groupMemberDTO, "Accepted"),
          404: StatusError(ErrorTypes.UnknownIdError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    acceptGroupInviteHandler
  );

  // POST /users/:username/groups/invites/:groupId/decline
  app.post(
    "/:username/groups/invites/:groupId/decline",
    {
      schema: {
        description: "This route declines a group invitation.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          groupId: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(Type.Null(), "Declined"),
          404: StatusError(ErrorTypes.UnknownIdError, "Not found"),
          500: StatusError(ErrorTypes.DeleteError, "Error"),
        },
      },
    },
    declineGroupInviteHandler
  );

  // GET /users/:username/friends
  app.get(
    "/:username/friends",
    {
      schema: {
        description: "This route fetches all accepted friends of the user.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        response: {
          200: StatusOK(Type.Array(profileDTO), "Success"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getFriendsHandler
  );

  // GET /users/:username/friends/:friendUsername
  app.get(
    "/:username/friends/:friendUsername",
    {
      schema: {
        description: "This route fetches a specific friend's profile details.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          friendUsername: Type.String(),
        }),
        response: {
          200: StatusOK(profileDTO, "Success"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getFriendProfileHandler
  );

  // DELETE /users/:username/friends/:friendUsername
  app.delete(
    "/:username/friends/:friendUsername",
    {
      schema: {
        description: "This route removes an existing friend relationship.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          friendUsername: Type.String(),
        }),
        response: {
          200: StatusOK(Type.Null(), "Removed"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.DeleteError, "Error"),
        },
      },
    },
    removeFriendHandler
  );

  // POST /users/:username/friends/:friendUsername/block
  app.post(
    "/:username/friends/:friendUsername/block",
    {
      schema: {
        description: "This route blocks a user.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          friendUsername: Type.String(),
        }),
        response: {
          200: StatusOK(Type.Null(), "Blocked"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    blockUserHandler
  );

  // POST /users/:username/friends/:friendUsername/unblock
  app.post(
    "/:username/friends/:friendUsername/unblock",
    {
      schema: {
        description: "This route unblocks a user.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          friendUsername: Type.String(),
        }),
        response: {
          200: StatusOK(Type.Null(), "Unblocked"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.DeleteError, "Error"),
        },
      },
    },
    unblockUserHandler
  );

  // POST /users/:username/friends/sendRequest
  app.post(
    "/:username/friends/sendRequest",
    {
      schema: {
        description: "This route sends a new friend request.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        body: SendFriendRequestBody,
        response: {
          200: StatusOK(Type.Null(), "Request sent"),
          400: StatusError(ErrorTypes.ExistingResourceError, "Already exists"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
        },
      },
    },
    sendFriendRequestHandler
  );

  // GET /users/:username/friends/requests
  app.get(
    "/:username/friends/requests",
    {
      schema: {
        description: "This route fetches all pending received friend requests.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        response: {
          200: StatusOK(Type.Array(FriendRequestDTO), "Success"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getPendingFriendRequestsHandler
  );

  // GET /users/:username/friends/requests/sent
  app.get(
    "/:username/friends/requests/sent",
    {
      schema: {
        description: "This route fetches all pending outgoing friend requests sent by the user.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        response: {
          200: StatusOK(Type.Array(SentFriendRequestDTO), "Success"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getPendingSentFriendRequestsHandler
  );

  // POST /users/:username/friends/requests/:senderUsername/accept
  app.post(
    "/:username/friends/requests/:senderUsername/accept",
    {
      schema: {
        description: "This route accepts a pending friend request.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          senderUsername: Type.String(),
        }),
        response: {
          200: StatusOK(Type.Null(), "Accepted"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    acceptFriendRequestHandler
  );

  // POST /users/:username/friends/requests/:senderUsername/decline
  app.post(
    "/:username/friends/requests/:senderUsername/decline",
    {
      schema: {
        description: "This route declines a pending friend request.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          senderUsername: Type.String(),
        }),
        response: {
          200: StatusOK(Type.Null(), "Declined"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    declineFriendRequestHandler
  );

  // GET /users/:username/settings
  app.get(
    "/:username/settings",
    {
      schema: {
        description: "This route fetches user profile settings.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        response: {
          200: StatusOK(Type.Any(), "Success"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
        },
      },
    },
    getUserSettingsHandler
  );

  // PATCH /users/:username/settings
  app.patch(
    "/:username/settings",
    {
      schema: {
        description: "This route updates user profile settings.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        body: Type.Any(),
        response: {
          200: StatusOK(Type.Any(), "Updated"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    updateUserSettingsHandler
  );
}