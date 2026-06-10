import type { FastifyReply, FastifyRequest } from "fastify";
import { getUserSettings, updateUserSettings } from "../services/profileServices";
import { createStatusError, createStatusOK, ErrorTypes, type SimpleUsernameParam } from "@baza/shared-types";
import { app } from "../setup";

// GET /users/:username/settings
export const getUserSettingsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received get user settings request");
  const { username } = req.params as SimpleUsernameParam;

  const result = await getUserSettings(username);

  if (!result.ok) {
    return res.status(404).send(
      createStatusError(
        ErrorTypes.UnknownUsernameError,
        "User profile not found."
      )
    );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// PATCH /users/:username/settings
export const updateUserSettingsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received update user settings request");
  const { username } = req.params as SimpleUsernameParam;
  const settings = req.body as any;

  const result = await updateUserSettings(username, settings);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "User profile not found."
          )
        );
      case ErrorTypes.UpdateError:
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.UpdateError,
            "Failed to update user settings."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};
