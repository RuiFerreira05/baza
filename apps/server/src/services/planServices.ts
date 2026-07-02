import { groupEvents, groupMembers, plans, votes } from "@baza/db/schemas";
import {
  type CreatePlanBody,
  type EditPlanBody,
  Err,
  ErrorTypes,
  Ok,
  planDTO,
  type PlanDTO,
  type Result,
} from "@baza/shared-types";
import { and, eq, sql } from "drizzle-orm";
import { Type } from "typebox";
import { Value } from "typebox/value";
import { db } from "../lib/db";
import { app } from "../setup";

export const createEventPlan = async (
  groupId: string,
  eventId: string,
  proposerUsername: string,
  body: CreatePlanBody,
): Promise<
  Result<
    PlanDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.ResourceCreationError
    | ErrorTypes.UnknownIdError
    | ErrorTypes.MalformedRequestError
  >
> => {
  try {
    const isAllDay = !!body.allDay;
    let startTimeVal: string;
    let endTimeVal: string;

    if (isAllDay) {
      startTimeVal = "00:00:00";
      endTimeVal = "23:59:59";
    } else {
      if (!body.startTime || !body.endTime) {
        app.log.warn(
          "Create event plan: startTime and endTime are required when allDay is false",
        );
        return Err(ErrorTypes.MalformedRequestError);
      }
      startTimeVal = body.startTime;
      endTimeVal = body.endTime;
    }

    if (startTimeVal >= endTimeVal) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    if (
      body.minBudget !== undefined &&
      body.maxBudget !== undefined &&
      body.minBudget >= body.maxBudget
    ) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);

    if (!event) {
      return Err(ErrorTypes.UnknownIdError);
    }

    if (
      event.state !== "unfinished" ||
      (event.votingEndTime && new Date() >= new Date(event.votingEndTime))
    ) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    const [member] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.username, proposerUsername),
        ),
      )
      .limit(1);

    if (!member) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const [newPlan] = await db
      .insert(plans)
      .values({
        groupEventId: eventId,
        username: proposerUsername,
        title: body.title,
        date: body.date,
        startTime: startTimeVal,
        endTime: endTimeVal,
        allDay: isAllDay,
        activity: body.activity ?? null,
        location: body.location,
        minBudget: body.minBudget ?? null,
        maxBudget: body.maxBudget ?? null,
      })
      .returning();

    if (newPlan) {
      const formatted = {
        ...newPlan,
        startTime: newPlan.startTime.includes("Z")
          ? newPlan.startTime
          : `${newPlan.startTime}Z`,
        endTime: newPlan.endTime.includes("Z")
          ? newPlan.endTime
          : `${newPlan.endTime}Z`,
        allDay: newPlan.allDay,
        votesCount: 0,
        createdAt: newPlan.createdAt.toISOString(),
        updatedAt: newPlan.updatedAt.toISOString(),
      };

      const conv = Value.Convert(planDTO, formatted);
      if (Value.Check(planDTO, conv)) {
        return Ok(conv);
      } else {
        const errorArray = Array.from(Value.Errors(planDTO, conv));
        app.log.error(
          { errors: errorArray },
          "Conversion check failed for planDTO",
        );
        return Err(ErrorTypes.ConversionError);
      }
    } else {
      return Err(ErrorTypes.ResourceCreationError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to create plan",
    );
    return Err(ErrorTypes.ResourceCreationError);
  }
};

export const getEventPlans = async (
  groupId: string,
  eventId: string,
): Promise<
  Result<PlanDTO[], ErrorTypes.ConversionError | ErrorTypes.UnknownIdError>
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);

    if (!event) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const proposals = await db
      .select({
        id: plans.id,
        groupEventId: plans.groupEventId,
        username: plans.username,
        title: plans.title,
        date: plans.date,
        startTime: plans.startTime,
        endTime: plans.endTime,
        allDay: plans.allDay,
        activity: plans.activity,
        location: plans.location,
        minBudget: plans.minBudget,
        maxBudget: plans.maxBudget,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
        votesCount: sql<number>`count(${votes.username})::int`,
      })
      .from(plans)
      .leftJoin(votes, eq(plans.id, votes.planId))
      .where(eq(plans.groupEventId, eventId))
      .groupBy(plans.id);

    const formatted = proposals.map((plan) => ({
      ...plan,
      startTime: plan.startTime.includes("Z")
        ? plan.startTime
        : `${plan.startTime}Z`,
      endTime: plan.endTime.includes("Z") ? plan.endTime : `${plan.endTime}Z`,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    }));

    const checkSchema = Value.Convert(Type.Array(planDTO), formatted);
    if (Value.Check(Type.Array(planDTO), checkSchema)) {
      return Ok(checkSchema as PlanDTO[]);
    } else {
      const errorArray = Array.from(
        Value.Errors(Type.Array(planDTO), checkSchema),
      );
      app.log.error(
        { errors: errorArray },
        "Conversion check failed for Array(planDTO)",
      );
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to get plans",
    );
    return Err(ErrorTypes.ConversionError);
  }
};

export const getEventPlanById = async (
  groupId: string,
  eventId: string,
  planId: string,
): Promise<
  Result<PlanDTO, ErrorTypes.ConversionError | ErrorTypes.UnknownIdError>
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);

    if (!event) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const [plan] = await db
      .select({
        id: plans.id,
        groupEventId: plans.groupEventId,
        username: plans.username,
        title: plans.title,
        date: plans.date,
        startTime: plans.startTime,
        endTime: plans.endTime,
        allDay: plans.allDay,
        activity: plans.activity,
        location: plans.location,
        minBudget: plans.minBudget,
        maxBudget: plans.maxBudget,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
        votesCount: sql<number>`count(${votes.username})::int`,
      })
      .from(plans)
      .leftJoin(votes, eq(plans.id, votes.planId))
      .where(and(eq(plans.id, planId), eq(plans.groupEventId, eventId)))
      .groupBy(plans.id)
      .limit(1);

    if (!plan) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const formatted = {
      ...plan,
      startTime: plan.startTime.includes("Z")
        ? plan.startTime
        : `${plan.startTime}Z`,
      endTime: plan.endTime.includes("Z") ? plan.endTime : `${plan.endTime}Z`,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };

    const conv = Value.Convert(planDTO, formatted);
    if (Value.Check(planDTO, conv)) {
      return Ok(conv);
    } else {
      const errorArray = Array.from(Value.Errors(planDTO, conv));
      app.log.error(
        { errors: errorArray },
        "Conversion check failed for planDTO",
      );
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to get plan by ID",
    );
    return Err(ErrorTypes.UnknownIdError);
  }
};

export const editEventPlan = async (
  groupId: string,
  eventId: string,
  planId: string,
  editorUsername: string,
  body: EditPlanBody,
): Promise<
  Result<
    PlanDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.UnknownIdError
    | ErrorTypes.UpdateError
    | ErrorTypes.MalformedRequestError
  >
> => {
  try {
    const [plan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.groupEventId, eventId)))
      .limit(1);

    if (!plan) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);

    if (!event) {
      return Err(ErrorTypes.UnknownIdError);
    }

    if (
      event.state !== "unfinished" ||
      (event.votingEndTime && new Date() >= new Date(event.votingEndTime))
    ) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    if (plan.username !== editorUsername) {
      return Err(ErrorTypes.UpdateError);
    }

    const isAllDay = body.allDay !== undefined ? body.allDay : plan.allDay;

    let startTimeVal: string;
    let endTimeVal: string;

    if (isAllDay) {
      startTimeVal = "00:00:00";
      endTimeVal = "23:59:59";
    } else {
      const rawStartTime =
        body.startTime !== undefined ? body.startTime : plan.startTime;
      const rawEndTime =
        body.endTime !== undefined ? body.endTime : plan.endTime;
      startTimeVal = rawStartTime.replace("Z", "");
      endTimeVal = rawEndTime.replace("Z", "");
    }

    if (startTimeVal >= endTimeVal) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    const mergedMinBudget =
      body.minBudget !== undefined ? body.minBudget : plan.minBudget;
    const mergedMaxBudget =
      body.maxBudget !== undefined ? body.maxBudget : plan.maxBudget;

    if (
      mergedMinBudget !== null &&
      mergedMaxBudget !== null &&
      mergedMinBudget >= mergedMaxBudget
    ) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    const [updated] = await db
      .update(plans)
      .set({
        title: body.title,
        date: body.date,
        startTime: startTimeVal,
        endTime: endTimeVal,
        allDay: isAllDay,
        activity: body.activity,
        location: body.location,
        minBudget: body.minBudget,
        maxBudget: body.maxBudget,
        updatedAt: new Date(),
      })
      .where(eq(plans.id, planId))
      .returning();

    if (!updated) {
      return Err(ErrorTypes.UpdateError);
    }

    return getEventPlanById(groupId, eventId, planId);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to edit plan",
    );
    return Err(ErrorTypes.UpdateError);
  }
};

export const voteEventPlan = async (
  groupId: string,
  eventId: string,
  planId: string,
  voterUsername: string,
): Promise<
  Result<
    null,
    | ErrorTypes.UnknownIdError
    | ErrorTypes.ResourceCreationError
    | ErrorTypes.MalformedRequestError
  >
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);
    if (!event) {
      return Err(ErrorTypes.UnknownIdError);
    }

    if (
      event.state !== "unfinished" ||
      (event.votingEndTime && new Date() >= new Date(event.votingEndTime))
    ) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    const [plan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.groupEventId, eventId)))
      .limit(1);
    if (!plan) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const [existing] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.planId, planId), eq(votes.username, voterUsername)))
      .limit(1);

    if (!existing) {
      await db.insert(votes).values({
        planId: planId,
        username: voterUsername,
      });
    }

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to vote for plan",
    );
    return Err(ErrorTypes.ResourceCreationError);
  }
};

export const removeVoteEventPlan = async (
  groupId: string,
  eventId: string,
  planId: string,
  voterUsername: string,
): Promise<
  Result<
    null,
    | ErrorTypes.UnknownIdError
    | ErrorTypes.DeleteError
    | ErrorTypes.MalformedRequestError
  >
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);
    if (!event) {
      return Err(ErrorTypes.UnknownIdError);
    }

    if (
      event.state !== "unfinished" ||
      (event.votingEndTime && new Date() >= new Date(event.votingEndTime))
    ) {
      return Err(ErrorTypes.MalformedRequestError);
    }

    const [plan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.groupEventId, eventId)))
      .limit(1);
    if (!plan) {
      return Err(ErrorTypes.UnknownIdError);
    }

    await db
      .delete(votes)
      .where(and(eq(votes.planId, planId), eq(votes.username, voterUsername)));
    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to remove vote",
    );
    return Err(ErrorTypes.DeleteError);
  }
};
