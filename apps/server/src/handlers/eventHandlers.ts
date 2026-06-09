import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthenticatedUsername } from "../lib/auth";
import { createGroupEvent, getGroupEvents, getGroupEventById, editGroupEvent, getGroupCalendar, getUserEvents } from "../services/eventServices";
import { resolveTie } from "../services/finalizationService";
import { createStatusError, createStatusOK, ErrorTypes, type SimpleUsernameParam, type GetPersonalEventsParams, type SimpleIdParam, type CreateEventBody, type EditEventBody } from "@baza/shared-types";
import { app } from "../setup";

// POST /groups/:id/events/create
export const createGroupEventHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received Create Group Event request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId } = req.params as SimpleIdParam;
  const body = req.body as CreateEventBody;

  const result = await createGroupEvent(groupId, username, body);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.MalformedRequestError:
        return res.status(400).send(
          createStatusError(
            ErrorTypes.MalformedRequestError,
            "Validation failed: votingEndTime must be earlier than the event startDate."
          )
        );
      case ErrorTypes.ConversionError:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.ConversionError,
            "Failed to convert created event data."
          )
        );
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.ResourceCreationError,
            "An error occurred while creating the event."
          )
        );
    }
  } else {
    return res.status(201).send(createStatusOK(result.value));
  }
};

// GET /groups/:id/events
export const getGroupEventsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received Get Group Events request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId } = req.params as SimpleIdParam;
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const result = await getGroupEvents(groupId, startDate, endDate);

  if (!result.ok) {
    return res.status(500).send(
      createStatusError(
        ErrorTypes.ConversionError,
        "An error occurred while querying events."
      )
    );
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /groups/:id/events/:idevent
export const getGroupEventByIdHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received Get Group Event by ID request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId, idevent: eventId } = req.params as { id: string; idevent: string };

  const result = await getGroupEventById(groupId, eventId);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownIdError,
            "Event not found in this group."
          )
        );
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.ConversionError,
            "Failed to convert event data."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// PATCH /groups/:id/events/:idevent/edit
export const editGroupEventHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received Edit Group Event request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId, idevent: eventId } = req.params as { id: string; idevent: string };
  const body = req.body as EditEventBody;

  const result = await editGroupEvent(groupId, eventId, body);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownIdError,
            "Event not found in this group."
          )
        );
      case ErrorTypes.MalformedRequestError:
        return res.status(400).send(
          createStatusError(
            ErrorTypes.MalformedRequestError,
            "Validation failed: votingEndTime must be earlier than the event startDate."
          )
        );
      case ErrorTypes.ConversionError:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.ConversionError,
            "Failed to convert event data."
          )
        );
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.UpdateError,
            "Failed to update event."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /groups/:id/events/:idevent/resolve-tie
export const resolveTieHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received Resolve Tie request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId, idevent: eventId } = req.params as { id: string; idevent: string };
  const { planId } = req.body as { planId: string };

  const result = await resolveTie(groupId, eventId, username, planId);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownIdError,
            "Event or proposed plan not found, or not in tie-breaker state."
          )
        );
      default:
        return res.status(403).send(
          createStatusError(
            ErrorTypes.UpdateError,
            "Action forbidden: You must be the event creator and choose one of the tied plans."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK({ message: "Tie successfully resolved." }));
  }
};

// GET /groups/:id/calendar
export const getGroupCalendarHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Received Get Group Calendar request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId } = req.params as SimpleIdParam;
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  const result = await getGroupCalendar(groupId, username, startDate, endDate);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownIdError,
            "Group not found."
          )
        );
      case ErrorTypes.UnauthorizedError:
        return res.status(403).send(
          createStatusError(
            ErrorTypes.UnauthorizedError,
            "Access denied: You are not an active member of this group."
          )
        );
      default:
        return res.status(500).send(
          createStatusError(
            ErrorTypes.ConversionError,
            "Failed to retrieve combined calendar."
          )
        );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /users/:username/events?startDate,endDate
export const getPersonalEventsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  app.log.info("Recieved get user's personal events by username request");
  const { username } = req.params as SimpleUsernameParam;
  const { startDate, endDate } = req.query as GetPersonalEventsParams;
  
  const result = await getUserEvents(username, startDate, endDate);

  if(!result.ok){
    switch (result.error) {
      case ErrorTypes.UnknownUsernameError:
        app.log.warn(`User not found`);
        return res.status(404).send(
          createStatusError(
            ErrorTypes.UnknownUsernameError,
            "A user with the provided username was not found",
          ),
        );
      
      case ErrorTypes.ConversionError:
        app.log.error(`Failed to convert events' data`);
        return res.status(500).send(
          createStatusError(
            ErrorTypes.ConversionError,
            "An error occurred while converting the events' data"
          )
        )
    }
  }
  else{
    return res.status(200).send(createStatusOK(result.value))
  }
};