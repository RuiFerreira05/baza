import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthenticatedUsername } from "../lib/auth";
import {
  createEventPlan,
  getEventPlans,
  getEventPlanById,
  editEventPlan,
  voteEventPlan,
  removeVoteEventPlan,
} from "../services/planServices";
import {
  createStatusError,
  createStatusOK,
  ErrorTypes,
  type CreatePlanBody,
  type EditPlanBody,
} from "@baza/shared-types";
import { app } from "../setup";

// POST /groups/:id/events/:idevent/plans/create
export const createEventPlanHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Create Plan proposal request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId, idevent: eventId } = req.params as {
    id: string;
    idevent: string;
  };
  const body = req.body as CreatePlanBody;

  const result = await createEventPlan(groupId, eventId, username, body);

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
              "Validation failed: startTime must be earlier than endTime, and minBudget must be less than maxBudget.",
            ),
          );
      case ErrorTypes.ConversionError:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert created plan data.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ResourceCreationError,
              "An error occurred while proposing the plan.",
            ),
          );
    }
  } else {
    return res.status(201).send(createStatusOK(result.value));
  }
};

// GET /groups/:id/events/:idevent/plans
export const getEventPlansHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Get Event Plans request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const { id: groupId, idevent: eventId } = req.params as {
    id: string;
    idevent: string;
  };

  const result = await getEventPlans(groupId, eventId);

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
              "An error occurred while fetching plan proposals.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// GET /groups/:id/events/:idevent/plans/:idplan
export const getEventPlanByIdHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Get Event Plan by ID request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const {
    id: groupId,
    idevent: eventId,
    idplan: planId,
  } = req.params as { id: string; idevent: string; idplan: string };

  const result = await getEventPlanById(groupId, eventId, planId);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "Plan proposal not found.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert plan proposal data.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// PATCH /groups/:id/events/:idevent/plans/:idplan/edit
export const editEventPlanHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Edit Plan proposal request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const {
    id: groupId,
    idevent: eventId,
    idplan: planId,
  } = req.params as { id: string; idevent: string; idplan: string };
  const body = req.body as EditPlanBody;

  const result = await editEventPlan(groupId, eventId, planId, username, body);

  if (!result.ok) {
    switch (result.error) {
      case ErrorTypes.UnknownIdError:
        return res
          .status(404)
          .send(
            createStatusError(
              ErrorTypes.UnknownIdError,
              "Plan proposal not found.",
            ),
          );
      case ErrorTypes.MalformedRequestError:
        return res
          .status(400)
          .send(
            createStatusError(
              ErrorTypes.MalformedRequestError,
              "Validation failed: startTime must be earlier than endTime, and minBudget must be less than maxBudget.",
            ),
          );
      case ErrorTypes.UpdateError:
        return res
          .status(403)
          .send(
            createStatusError(
              ErrorTypes.UpdateError,
              "Action forbidden: Only the proposer can update this plan.",
            ),
          );
      default:
        return res
          .status(500)
          .send(
            createStatusError(
              ErrorTypes.ConversionError,
              "Failed to convert updated plan data.",
            ),
          );
    }
  } else {
    return res.status(200).send(createStatusOK(result.value));
  }
};

// POST /groups/:id/events/:idevent/plans/:idplan/vote
export const voteEventPlanHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Vote request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const {
    id: groupId,
    idevent: eventId,
    idplan: planId,
  } = req.params as { id: string; idevent: string; idplan: string };

  const result = await voteEventPlan(groupId, eventId, planId, username);

  if (!result.ok) {
    if (result.error === ErrorTypes.MalformedRequestError) {
      return res
        .status(400)
        .send(
          createStatusError(
            ErrorTypes.MalformedRequestError,
            "Voting is closed for this event.",
          ),
        );
    }
    return res
      .status(404)
      .send(
        createStatusError(
          ErrorTypes.UnknownIdError,
          "Event or plan proposal not found.",
        ),
      );
  } else {
    return res
      .status(200)
      .send(createStatusOK({ message: "Vote successfully casted." }));
  }
};

// POST /groups/:id/events/:idevent/plans/:idplan/remove-vote
export const removeVoteEventPlanHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  app.log.info("Received Remove Vote request");
  const username = await getAuthenticatedUsername(req, res);
  if (!username) return;

  const {
    id: groupId,
    idevent: eventId,
    idplan: planId,
  } = req.params as { id: string; idevent: string; idplan: string };

  const result = await removeVoteEventPlan(groupId, eventId, planId, username);

  if (!result.ok) {
    if (result.error === ErrorTypes.MalformedRequestError) {
      return res
        .status(400)
        .send(
          createStatusError(
            ErrorTypes.MalformedRequestError,
            "Voting is closed for this event.",
          ),
        );
    }
    return res
      .status(404)
      .send(
        createStatusError(
          ErrorTypes.UnknownIdError,
          "Event or plan proposal not found.",
        ),
      );
  } else {
    return res
      .status(200)
      .send(createStatusOK({ message: "Vote successfully removed." }));
  }
};
