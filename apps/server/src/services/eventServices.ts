import { events, groupEvents } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, and, lte, gte } from "drizzle-orm";
import { ErrorTypes, groupEventDTO, type GroupEventDTO, type CreateEventBody, type EditEventBody } from "@baza/shared-types";
import { Value } from "typebox/value";
import { Type } from "typebox";
import { Err, Ok, type Result } from "../lib/types";
import { app } from "../setup";
import { finalizeEvent } from "./finalizationService";

/**
 * Creates a new group event with an associated base event.
 * Validates that the votingEndTime is strictly earlier than the startDate.
 * 
 * @param groupId the UUID of the group
 * @param creatorUsername the username of the event creator
 * @param body the payload containing the title, description, dates, and voting end time
 * @returns a promised result with the created GroupEventDTO, or an error
 */
export const createGroupEvent = async (
  groupId: string,
  creatorUsername: string,
  body: CreateEventBody
): Promise<Result<GroupEventDTO, ErrorTypes.ConversionError | ErrorTypes.ResourceCreationError | ErrorTypes.MalformedRequestError>> => {
  try {
    const startDateVal = new Date(body.startDate);
    const votingEndTimeVal = new Date(body.votingEndTime);

    if (votingEndTimeVal >= startDateVal) {
      app.log.warn(`Create event constraint violated: votingEndTime (${body.votingEndTime}) must be earlier than startDate (${body.startDate})`);
      return Err(ErrorTypes.MalformedRequestError);
    }

    const created = await db.transaction(async (tx) => {
      const [newEvent] = await tx.insert(events).values({
        title: body.title,
        description: body.description,
      }).returning();

      if (!newEvent) {
        throw new Error("Failed to insert base event");
      }

      const [newGroupEvent] = await tx.insert(groupEvents).values({
        id: newEvent.id,
        groupId: groupId,
        startDate: body.startDate,
        endDate: body.endDate,
        state: "unfinished",
        votingEndTime: new Date(body.votingEndTime),
        createdBy: creatorUsername,
      }).returning();

      if (!newGroupEvent) {
        throw new Error("Failed to insert group event");
      }

      return {
        id: newGroupEvent.id,
        groupId: newGroupEvent.groupId!,
        title: newEvent.title,
        description: newEvent.description,
        startDate: newGroupEvent.startDate,
        endDate: newGroupEvent.endDate,
        state: newGroupEvent.state as GroupEventDTO["state"],
        votingEndTime: newGroupEvent.votingEndTime?.toISOString() ?? null,
        createdBy: newGroupEvent.createdBy,
        createdAt: newEvent.createdAt.toISOString(),
        updatedAt: newEvent.updatedAt.toISOString(),
      };
    });

    if (created) {
      const conv = Value.Convert(groupEventDTO, created);
      if (Value.Check(groupEventDTO, conv)) {
        return Ok(conv);
      } else {
        app.log.error(Value.Errors(groupEventDTO, conv));
        return Err(ErrorTypes.ConversionError);
      }
    } else {
      return Err(ErrorTypes.ResourceCreationError);
    }
  } catch (error) {
    app.log.error(error as any, "Failed to create group event");
    return Err(ErrorTypes.ResourceCreationError);
  }
};

/**
 * Fetches all events associated with a specific group, optionally filtered by date ranges.
 * 
 * @param groupId the UUID of the group
 * @param startDate optional date window start
 * @param endDate optional date window end
 * @returns a promised result with the list of GroupEventDTOs, or an error
 */
export const getGroupEvents = async (
  groupId: string,
  startDate?: string,
  endDate?: string
): Promise<Result<GroupEventDTO[], ErrorTypes.ConversionError>> => {
  try {
    const conditions = [eq(groupEvents.groupId, groupId)];
    if (startDate) {
      conditions.push(gte(groupEvents.startDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(groupEvents.endDate, endDate));
    }

    let query = db.select({
      id: groupEvents.id,
      groupId: groupEvents.groupId,
      title: events.title,
      description: events.description,
      startDate: groupEvents.startDate,
      endDate: groupEvents.endDate,
      state: groupEvents.state,
      votingEndTime: groupEvents.votingEndTime,
      createdBy: groupEvents.createdBy,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(groupEvents)
    .innerJoin(events, eq(groupEvents.id, events.id))
    .where(and(...conditions));

    const unfinishedEvents = await db
      .select()
      .from(groupEvents)
      .where(
        and(
          eq(groupEvents.groupId, groupId),
          eq(groupEvents.state, "unfinished"),
          lte(groupEvents.votingEndTime, new Date())
        )
      );

    for (const ge of unfinishedEvents) {
      await finalizeEvent(ge.id);
    }

    const rows = await query;

    const formatted = rows.map(row => ({
      id: row.id,
      groupId: row.groupId!,
      title: row.title,
      description: row.description,
      startDate: row.startDate,
      endDate: row.endDate,
      state: row.state as GroupEventDTO["state"],
      votingEndTime: row.votingEndTime?.toISOString() ?? null,
      createdBy: row.createdBy,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    const checkSchema = Value.Convert(Type.Array(groupEventDTO), formatted);
    if (Value.Check(Type.Array(groupEventDTO), checkSchema)) {
      return Ok(checkSchema as GroupEventDTO[]);
    } else {
      app.log.error(Value.Errors(Type.Array(groupEventDTO), checkSchema));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(error as any, "Failed to query group events");
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * Fetches details of a specific group event by its ID.
 * If the event has reached its votingEndTime and is still unfinished, triggers automated plan finalization.
 * 
 * @param groupId the UUID of the group
 * @param eventId the UUID of the event
 * @returns a promised result with the GroupEventDTO, or an error
 */
export const getGroupEventById = async (
  groupId: string,
  eventId: string
): Promise<Result<GroupEventDTO, ErrorTypes.ConversionError | ErrorTypes.UnknownIdError>> => {
  try {
    const [eventRecord] = await db
      .select()
      .from(groupEvents)
      .where(eq(groupEvents.id, eventId))
      .limit(1);

    if (eventRecord && eventRecord.state === "unfinished" && eventRecord.votingEndTime && new Date() >= new Date(eventRecord.votingEndTime)) {
      await finalizeEvent(eventId);
    }

    const rows = await db.select({
      id: groupEvents.id,
      groupId: groupEvents.groupId,
      title: events.title,
      description: events.description,
      startDate: groupEvents.startDate,
      endDate: groupEvents.endDate,
      state: groupEvents.state,
      votingEndTime: groupEvents.votingEndTime,
      createdBy: groupEvents.createdBy,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(groupEvents)
    .innerJoin(events, eq(groupEvents.id, events.id))
    .where(and(eq(groupEvents.groupId, groupId), eq(groupEvents.id, eventId)));

    if (rows.length === 1) {
      const row = rows[0]!;
      const formatted = {
        id: row.id,
        groupId: row.groupId!,
        title: row.title,
        description: row.description,
        startDate: row.startDate,
        endDate: row.endDate,
        state: row.state as GroupEventDTO["state"],
        votingEndTime: row.votingEndTime?.toISOString() ?? null,
        createdBy: row.createdBy,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };

      const conv = Value.Convert(groupEventDTO, formatted);
      if (Value.Check(groupEventDTO, conv)) {
        return Ok(conv);
      } else {
        app.log.error(Value.Errors(groupEventDTO, conv));
        return Err(ErrorTypes.ConversionError);
      }
    } else {
      return Err(ErrorTypes.UnknownIdError);
    }
  } catch (error) {
    app.log.error(error as any, "Failed to query group event by ID");
    return Err(ErrorTypes.UnknownIdError);
  }
};

/**
 * Modifies an existing group event's title, description, and voting end time.
 * Validates that the updated votingEndTime is strictly earlier than the event startDate.
 * 
 * @param groupId the UUID of the group
 * @param eventId the UUID of the event
 * @param body the edit payload
 * @returns a promised result with the updated GroupEventDTO, or an error
 */
export const editGroupEvent = async (
  groupId: string,
  eventId: string,
  body: EditEventBody
): Promise<Result<GroupEventDTO, ErrorTypes.ConversionError | ErrorTypes.UnknownIdError | ErrorTypes.MalformedRequestError | ErrorTypes.UpdateError>> => {
  try {
    const [eventRecord] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);

    if (!eventRecord) {
      return Err(ErrorTypes.UnknownIdError);
    }

    if (body.votingEndTime) {
      const newVotingEnd = new Date(body.votingEndTime);
      const startDate = new Date(eventRecord.startDate);

      if (newVotingEnd >= startDate) {
        app.log.warn(`Edit event constraint violated: votingEndTime (${body.votingEndTime}) must be earlier than startDate (${eventRecord.startDate})`);
        return Err(ErrorTypes.MalformedRequestError);
      }
    }

    await db.transaction(async (tx) => {
      if (body.title !== undefined || body.description !== undefined) {
        await tx.update(events).set({
          title: body.title,
          description: body.description,
          updatedAt: new Date(),
        }).where(eq(events.id, eventId));
      }

      if (body.votingEndTime !== undefined) {
        await tx.update(groupEvents).set({
          votingEndTime: new Date(body.votingEndTime),
        }).where(eq(groupEvents.id, eventId));
      }
    });

    return getGroupEventById(groupId, eventId);
  } catch (error) {
    app.log.error(error as any, "Failed to edit group event");
    return Err(ErrorTypes.UpdateError);
  }
};