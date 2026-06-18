import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthenticatedUsername } from "../lib/auth";
import {
  confirmEventAttendance,
  revokeEventAttendance,
  getEventConfirmations,
} from "../services/eventServices";
import {
  createStatusError,
  createStatusOK,
  ErrorTypes,
} from "@baza/shared-types";
import { app } from "../setup";

// POST /groups/:groupId/events/:eventId/confirm
export const confirmEventAttendanceHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Confirm Event Attendance request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId } = req.params as { id: string; idevent: string };
  const confirmedAt = new Date().toISOString();

  const result = await confirmEventAttendance(groupId, username, confirmedAt);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.ConversionError:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert confirmation data.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ResourceCreationError,
              "An error occurred while confirming attendance.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// DELETE /groups/:groupId/events/:eventId/confirm
export const revokeEventAttendanceHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Revoke Event Attendance Confirmation request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId } = req.params as { id: string; idevent: string };

  const result = await revokeEventAttendance(groupId, username);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "Attendance confirmation not found.",
            ),
          );
      case ErrorTypes.DeleteError:
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.DeleteError,
              "An error occurred while revoking attendance confirmation.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /groups/:groupId/events/:eventId/confirmations
export const getEventConfirmationsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Get Event Confirmations request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId } = req.params as { id: string; idevent: string };

  const result = await getEventConfirmations(groupId);

  if (!result.ok) {
    return res
      .status(500)
      .send(
        createStatusError(
          ErrorTypes.ConversionError,
          "An error occurred while retrieving event confirmations.",
        ),
      );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};
