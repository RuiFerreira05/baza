import {
  BlockUserBody,
  CreatePersonalEventBody,
  CreateProfileBody,
  EditPersonalEventBody,
  EditProfileBody,
  ErrorTypes,
  FriendRequestDTO,
  GetPersonalEventsParams,
  groupDTO,
  groupMemberDTO,
  personalEventDTO,
  profileDTO,
  RespondFriendRequestBody,
  RespondGroupInviteBody,
  SendFriendRequestBody,
  SentFriendRequestDTO,
  SimpleUsernameParam,
  StatusError,
  StatusOK,
} from "@baza/shared-types";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyPluginAsync } from "fastify";
import Type from "typebox";
import {
  createPersonalEventHandler,
  deletePersonalEventHandler,
  editPersonalEventHandler,
  getPersonalEventByIdHandler,
  getPersonalEventsHandler,
} from "../handlers/eventHandlers";
import {
  blockUserHandler,
  getFriendProfileHandler,
  getFriendsHandler,
  getPendingFriendRequestsHandler,
  getPendingSentFriendRequestsHandler,
  removeFriendHandler,
  respondFriendRequestHandler,
  sendFriendRequestHandler,
  unblockUserHandler,
} from "../handlers/friendHandlers";
import {
  createUserProfileHandler,
  deleteProfilePhotoHandler,
  deleteUserProfileHandler,
  editProfilePhotoHandler,
  editUserProfileHandler,
  getCurrentUserProfileHandler,
  getProfilePhotoHandler,
  getUserByUsernameHandler,
} from "../handlers/profileHandlers";
import {
  getUserSettingsHandler,
  updateUserSettingsHandler,
} from "../handlers/settingsHandlers";
import {
  getUserGroupInvitesHandler,
  getUserGroupsHandler,
  respondGroupInviteHandler,
} from "../handlers/userGroupHandlers";

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // POST /users
  app.post(
    "/",
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
          401: StatusError(
            ErrorTypes.UnauthorizedError,
            "if the user is not authenticated and authorized to create a profile",
          ),
          500: StatusError(
            ErrorTypes.ConversionError,
            "if the profile was created but there was an error converting it to the expected format before sending the response",
          ),
        },
      },
    },
    createUserProfileHandler,
  );

  // GET /users/me
  app.get(
    "/me",
    {
      schema: {
        description:
          "This route fetches profile information from the currently logged-in user",
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
      },
    },
    getCurrentUserProfileHandler,
  );

  // GET /users/:username
  app.get(
    "/:username",
    {
      schema: {
        description:
          "This route fetches profile information from a user of the app",
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
        params: SimpleUsernameParam(
          "Username of a user of the aplication whose profile is being fetched",
        ),
      },
    },
    getUserByUsernameHandler,
  );

  // DELETE /users/:username
  app.delete(
    "/:username",
    {
      schema: {
        description: "This route deletes a user's profile",
        tags: ["users"],
        params: SimpleUsernameParam(
          "The username of the user whose profile is being deleted",
        ),
        response: {
          200: StatusOK(profileDTO, "if the profile was successfully deleted"),
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
    deleteUserProfileHandler,
  );

  // PATCH /users/:username
  app.patch(
    "/:username",
    {
      schema: {
        description:
          "This route edits a user's profile information (except photo and settings)",
        tags: ["users"],
        params: SimpleUsernameParam(
          "The username of the user whose profile is being edited",
        ),
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
    editUserProfileHandler,
  );

  // GET /users/:username/events?startDate,endDate
  app.get(
    "/:username/events",
    {
      schema: {
        description:
          "This route fetches all events, in the given time period, from a user calendar.",
        tags: ["users"],
        params: SimpleUsernameParam(
          "The username of the user whose events are being fetched",
        ),
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
    getPersonalEventsHandler,
  );

  // GET /users/:username/events/:idEvent
  app.get(
    "/:username/events/:idEvent",
    {
      schema: {
        description:
          "This route fetches a single personal event by username and event ID.",
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
    getPersonalEventByIdHandler,
  );

  // POST /users/:username/events
  app.post(
    "/:username/events",
    {
      schema: {
        description: "This route creates a new personal event.",
        tags: ["users"],
        params: SimpleUsernameParam(
          "The username of the user creating the event",
        ),
        body: CreatePersonalEventBody,
        response: {
          201: StatusOK(personalEventDTO, "Created"),
          400: StatusError(ErrorTypes.MalformedRequestError, "Bad request"),
          500: StatusError(ErrorTypes.ResourceCreationError, "Error"),
        },
      },
    },
    createPersonalEventHandler,
  );

  // PATCH /users/:username/events/:idEvent
  app.patch(
    "/:username/events/:idEvent",
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
    editPersonalEventHandler,
  );

  // DELETE /users/:username/events/:idEvent
  app.delete(
    "/:username/events/:idEvent",
    {
      schema: {
        description: "This route deletes an existing personal event.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String({ description: "The username" }),
          idEvent: Type.String({ format: "uuid" }),
        }),
        response: {
          200: StatusOK(Type.Null(), "Deleted"),
          403: StatusError(ErrorTypes.UnauthorizedError, "Forbidden"),
          404: StatusError(ErrorTypes.UnknownIdError, "Not found"),
          500: StatusError(ErrorTypes.DeleteError, "Error"),
        },
      },
    },
    deletePersonalEventHandler,
  );

  // GET /users/:username/groups
  app.get(
    "/:username/groups",
    {
      schema: {
        description:
          "This route fetches all groups that the user is an active member of.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        response: {
          200: StatusOK(Type.Array(groupDTO), "Success"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getUserGroupsHandler,
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
    getUserGroupInvitesHandler,
  );

  // PATCH /users/:username/groups/invites/:groupId
  app.patch(
    "/:username/groups/invites/:groupId",
    {
      schema: {
        description:
          "This route responds (accept or decline) to a group invitation.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          groupId: Type.String({ format: "uuid" }),
        }),
        body: RespondGroupInviteBody,
        response: {
          200: StatusOK(
            Type.Union([groupMemberDTO, Type.Null()]),
            "If the group invite response was successful",
          ),
          404: StatusError(ErrorTypes.UnknownIdError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    respondGroupInviteHandler,
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
    getFriendsHandler,
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
    getFriendProfileHandler,
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
    removeFriendHandler,
  );

  // POST /users/:username/blocks
  app.post(
    "/:username/blocks",
    {
      schema: {
        description: "This route blocks a user.",
        tags: ["users"],
        params: SimpleUsernameParam("The username of the blocker"),
        body: BlockUserBody,
        response: {
          200: StatusOK(Type.Null(), "Blocked"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    blockUserHandler,
  );

  // DELETE /users/:username/blocks/:blockedUsername
  app.delete(
    "/:username/blocks/:blockedUsername",
    {
      schema: {
        description: "This route unblocks a user.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          blockedUsername: Type.String(),
        }),
        response: {
          200: StatusOK(Type.Null(), "Unblocked"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.DeleteError, "Error"),
        },
      },
    },
    unblockUserHandler,
  );

  // POST /users/:username/friends/requests
  app.post(
    "/:username/friends/requests",
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
    sendFriendRequestHandler,
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
    getPendingFriendRequestsHandler,
  );

  // GET /users/:username/friends/requests/sent
  app.get(
    "/:username/friends/requests/sent",
    {
      schema: {
        description:
          "This route fetches all pending outgoing friend requests sent by the user.",
        tags: ["users"],
        params: SimpleUsernameParam("The username"),
        response: {
          200: StatusOK(Type.Array(SentFriendRequestDTO), "Success"),
          500: StatusError(ErrorTypes.ConversionError, "Error"),
        },
      },
    },
    getPendingSentFriendRequestsHandler,
  );

  // PATCH /users/:username/friends/requests/:senderUsername
  app.patch(
    "/:username/friends/requests/:senderUsername",
    {
      schema: {
        description:
          "This route responds to (accepts/declines) a pending friend request.",
        tags: ["users"],
        params: Type.Object({
          username: Type.String(),
          senderUsername: Type.String(),
        }),
        body: RespondFriendRequestBody,
        response: {
          200: StatusOK(Type.Null(), "Responded successfully"),
          404: StatusError(ErrorTypes.UnknownUsernameError, "Not found"),
          500: StatusError(ErrorTypes.UpdateError, "Error"),
        },
      },
    },
    respondFriendRequestHandler,
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
    getUserSettingsHandler,
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
    updateUserSettingsHandler,
  );

  // PATCH /users/:username/photo
  app.patch(
    "/:username/photo",
    {
      schema: {
        description: "This route allows editing a profile's photo",
        tags: ["users"],
        params: SimpleUsernameParam(
          "The username of the profile whose photo is being edited",
        ),
        response: {
          201: StatusOK(
            profileDTO,
            "if the profile photo was successfully updated and the updated profile data was successfully converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownUsernameError,
            "if no profile with the provided username was found",
          ),
          500: StatusError(
            ErrorTypes.ResourceCreationError,
            "if there was an error saving the profile photo or updating the profile with the new photo",
          ),
        },
      },
    },
    editProfilePhotoHandler,
  );

  // GET /profile/:username/photo
  app.get(
    "/:username/photo",
    {
      schema: {
        description: "This route fetches a profile's photo",
        tags: ["users"],
        params: SimpleUsernameParam(
          "The username of the profile whose photo is being fetched",
        ),
        response: {
          200: Type.String({
            description: "The profile photo as a stream",
          }),
          404: StatusError(
            ErrorTypes.UnknownUsernameError,
            "if no profile with the provided username was found or if the profile does not have a photo",
          ),
          500: StatusError(
            ErrorTypes.ResourceCreationError,
            "if there was an error fetching the profile photo",
          ),
        },
      },
    },
    getProfilePhotoHandler,
  );

  // DELETE /users/:username/photo
  app.delete(
    "/:username/photo",
    {
      schema: {
        description: "This route deletes a profile's photo",
        tags: ["users"],
        params: SimpleUsernameParam(
          "The username of the profile whose photo is being deleted",
        ),
        response: {
          200: StatusOK(
            profileDTO,
            "if the profile photo was successfully deleted and the updated profile data was successfully converted to the expected format before sending the response",
          ),
          404: StatusError(
            ErrorTypes.UnknownUsernameError,
            "if no profile with the provided username was found or if the profile does not have a photo",
          ),
          500: StatusError(
            ErrorTypes.DeleteError,
            "if there was an error deleting the profile photo",
          ),
        },
      },
    },
    deleteProfilePhotoHandler,
  );
};
