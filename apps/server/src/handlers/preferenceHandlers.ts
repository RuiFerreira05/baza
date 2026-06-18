import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthenticatedUsername } from "../lib/auth";
import {
  createOrEditEventPreference,
  getEventPreferenceByUsername,
  getEventPreferences,
  getGroupPreferenceAggregation,
} from "../services/preferenceServices";
import {
  createStatusError,
  createStatusOK,
  ErrorTypes,
  type CreatePreferenceBody,
} from "@baza/shared-types";
import { app } from "../setup";

// POST /groups/:id/events/:idevent/preferences/create (or edit)
export const createOrEditEventPreferenceHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Create/Edit Preference request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId, idevent: eventId } = req.params as {
    id: string;
    idevent: string;
  };
  const body = req.body as CreatePreferenceBody;

  const result = await createOrEditEventPreference(
    groupId,
    eventId,
    username,
    body,
  );

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "Event not found in group, or user is not a group member.",
            ),
          );
      case ErrorTypes.MalformedRequestError:
        return res
          .status(400)
          .send(
            createStatusError(
              ErrorTypes.MalformedRequestError,
              "Preferences are locked. The voting period for this event has ended.",
            ),
          );
      case ErrorTypes.ConversionError:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert saved preference data.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ResourceCreationError,
              "An error occurred while saving the preference.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /groups/:id/events/:idevent/preferences/:username
export const getEventPreferenceByUsernameHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Get User Preference request");
  const requesterUsername = await getAuthenticatedUsername(req, res);
  if (!requesterUsername) return;

  const {
    id: groupId,
    idevent: eventId,
    username,
  } = req.params as { id: string; idevent: string; username: string };

  const result = await getEventPreferenceByUsername(
    groupId,
    eventId,
    username,
    requesterUsername,
  );

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "Preference not found or is marked as private.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert preference data.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /groups/:id/events/:idevent/preferences/all
export const getEventPreferencesHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Get All Event Preferences request");
  const requesterUsername = await getAuthenticatedUsername(req, res);
  if (!requesterUsername) return;

  const { id: groupId, idevent: eventId } = req.params as {
    id: string;
    idevent: string;
  };

  const result = await getEventPreferences(groupId, eventId, requesterUsername);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "Event not found in this group.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert preferences data.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /groups/:id/events/:idevent/preferences/group
export const getGroupPreferenceAggregationHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Get Group Preferences Aggregation request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId, idevent: eventId } = req.params as {
    id: string;
    idevent: string;
  };

  const result = await getGroupPreferenceAggregation(groupId, eventId);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "Event not found in this group.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "An error occurred while compiling the aggregated preference report.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};
