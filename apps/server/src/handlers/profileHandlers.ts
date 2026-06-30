import {
  createStatusError,
  createStatusOK,
  ErrorTypes,
  type CreateProfileBody,
  type EditProfileBody,
  type SimpleUsernameParam,
} from "@baza/shared-types";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createUserProfile,
  deleteUserProfile,
  editUserProfile,
  getUserByUsername,
} from "../services/profileServices";
import { app } from "../setup";

// GET /users/:username
export const getUserByUsernameHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Recieved get user's profile by username request");
  const { username } = req.params as SimpleUsernameParam;

  app.log.info(`Fetching profile from user with username: ${username}`);
  const data = await getUserByUsername(username);

  if (!data.ok) {
    switch (data.error) {
      case ErrorTypes.UnknownUsernameError:
        app.log.warn("User's profile not found");
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "The profile from a user with the username provided was not found",
            ),
          );

      case ErrorTypes.ConversionError:
        app.log.error("Failed to convert profile");
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the profile data",
            ),
          );
    }
  } else {
    return res.send(createStatusOK(data.value));
  }
};

// POST /users
export const createUserProfileHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received create user's profile request");
  const body = req.body as CreateProfileBody;
  const userId = req.session?.user?.id;
  if (!userId) {
    app.log.error("User ID missing from request in createUserProfileHandler");
    return res
      .status(401)
      .send(
        createStatusError(
          ErrorTypes.UnauthorizedError,
          "Unauthorized request. User ID not found.",
        ),
      );
  }

  const result = await createUserProfile(body.username, userId);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.ConversionError:
        app.log.error("Failed to convert created profile");
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the created profile data",
            ),
          );
      case ErrorTypes.ResourceCreationError:
        app.log.error("Failed to create profile");
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ResourceCreationError,
              "An error occurred while creating the profile",
            ),
          );
      case ErrorTypes.ExistingResourceError:
        app.log.warn(`Profile with username ${body.username} already exists`);
        return res
          .status(409)
          .send(
            createStatusError(
              ErrorTypes.ExistingResourceError,
              "This username is already taken. Please choose another one.",
            ),
          );
    }
  } else {
    return res.send(createStatusOK(result.value));
  }
};

// POST /users/:username/delete
export const deleteUserProfileHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received delete user's profile request");
  const { username } = req.params as SimpleUsernameParam;
  const result = await deleteUserProfile(username);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        app.log.error("User not found");
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "A user with the provided username was not found",
            ),
          );
      case ErrorTypes.DeleteError:
        app.log.error(
          `Failed to delete users's profile with username ${username} `,
        );
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.DeleteError,
              "An error occurred while deleting the profile",
            ),
          );
    }
  } else {
    return res.send(createStatusOK(result.value));
  }
};

// PATCH /users/:username/edit
export const editUserProfileHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received  user's profile request");
  const { username } = req.params as SimpleUsernameParam;
  const { newUsername, newDescription } = req.body as EditProfileBody;
  const result = await editUserProfile(username, newUsername, newDescription);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        app.log.warn("User not found");
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "A user with the provided username was not found",
            ),
          );
      case ErrorTypes.ConversionError:
        app.log.error("Failed to convert updated profile data");
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the updated profile data",
            ),
          );
      case ErrorTypes.ExistingResourceError:
        app.log.warn(`User with name ${username} already exists`);
        return res
          .status(400)
          .send(
            createStatusError(
              ErrorTypes.ExistingResourceError,
              `A user with the name ${username} already exists`,
            ),
          );
    }
  } else {
    return res.send(createStatusOK(result.value));
  }
};

// GET /users/me
export const getCurrentUserProfileHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received get current user's profile request");
  const username = req.username;

  if (!username) {
    app.log.error(
      "Username missing from request in getCurrentUserProfileHandler",
    );
    return res
      .status(401)
      .send(
        createStatusError(
          ErrorTypes.UnauthorizedError,
          "Unauthorized request. User profile not found.",
        ),
      );
  }

  app.log.info(`Fetching profile for authenticated user: ${username}`);
  const data = await getUserByUsername(username);

  if (!data.ok) {
    switch (data.error) {
      case ErrorTypes.UnknownUsernameError:
        app.log.warn("User's profile not found");
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownUsernameError,
              "The profile from a user with the username provided was not found",
            ),
          );

      case ErrorTypes.ConversionError:
        app.log.error("Failed to convert profile");
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while converting the profile data",
            ),
          );
    }
  } else {
    return res.send(createStatusOK(data.value));
  }
};
