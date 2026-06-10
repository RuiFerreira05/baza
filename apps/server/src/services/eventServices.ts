import { events, groupEvents, personalEvents, groupMembers, groups } from "@baza/db/schemas";
import { db } from "../lib/db";
import { eq, and, lte, gte, inArray } from "drizzle-orm";
import { ErrorTypes, groupEventDTO, personalEventDTO, groupCalendarDTO, type PersonalEventDTO, type GroupCalendarDTO, type GroupEventDTO, type CreateEventBody, type EditEventBody } from "@baza/shared-types";
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

/**
 * Retrieves the combined calendar for a group, which includes group events and members' personal events.
 * Private personal events are masked to hide sensitive details if requested by a different user.
 * 
 * @param groupId the UUID of the group
 * @param requestingUsername the username of the user making the request
 * @param startDate optional start date filter
 * @param endDate optional end date filter
 * @returns a promised result with the GroupCalendarDTO, or an error
 */
export const getGroupCalendar = async (
  groupId: string,
  requestingUsername: string,
  startDate?: string,
  endDate?: string
): Promise<Result<GroupCalendarDTO, ErrorTypes.ConversionError | ErrorTypes.UnauthorizedError | ErrorTypes.UnknownIdError>> => {
  try {
    // 1. Verify group exists
    const [groupExists] = await db
      .select({ id: groups.id })
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!groupExists) {
      app.log.warn(`GetGroupCalendar: Group with id ${groupId} not found`);
      return Err(ErrorTypes.UnknownIdError);
    }

    // 2. Check requester membership (must be accepted and not banned)
    const [requesterMember] = await db
      .select({ username: groupMembers.username })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.username, requestingUsername),
          eq(groupMembers.acceptedInvite, true),
          eq(groupMembers.banned, false)
        )
      )
      .limit(1);

    if (!requesterMember) {
      app.log.warn(`GetGroupCalendar: Access denied for user ${requestingUsername} in group ${groupId}`);
      return Err(ErrorTypes.UnauthorizedError);
    }

    // 3. Fetch all active (accepted and not banned) group members
    const members = await db
      .select({ username: groupMembers.username })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.acceptedInvite, true),
          eq(groupMembers.banned, false)
        )
      );

    const memberUsernames = members.map((m) => m.username);

    // 4. Fetch group events within the date range
    const groupEventsConditions = [eq(groupEvents.groupId, groupId)];
    if (startDate) {
      groupEventsConditions.push(gte(groupEvents.startDate, startDate));
    }
    if (endDate) {
      groupEventsConditions.push(lte(groupEvents.endDate, endDate));
    }

    const dbGroupEvents = await db.select({
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
    .where(and(...groupEventsConditions));

    const formattedGroupEvents = dbGroupEvents.map((row) => ({
      id: row.id,
      groupId: row.groupId!,
      title: row.title,
      description: row.description,
      startDate: row.startDate,
      endDate: row.endDate,
      state: row.state as any,
      votingEndTime: row.votingEndTime?.toISOString() ?? null,
      createdBy: row.createdBy,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    // 5. Fetch personal events for group members
    let formattedMemberEvents: any[] = [];
    if (memberUsernames.length > 0) {
      const personalEventsConditions = [inArray(personalEvents.username, memberUsernames)];
      if (startDate) {
        personalEventsConditions.push(gte(personalEvents.date, startDate));
      }
      if (endDate) {
        personalEventsConditions.push(lte(personalEvents.date, endDate));
      }

      const dbPersonalEvents = await db.select({
        id: personalEvents.id,
        username: personalEvents.username,
        date: personalEvents.date,
        location: personalEvents.location,
        startTime: personalEvents.startTime,
        endTime: personalEvents.endTime,
        repeat: personalEvents.repeat,
        public: personalEvents.public,
        title: events.title,
        description: events.description,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(personalEvents)
      .innerJoin(events, eq(personalEvents.id, events.id))
      .where(and(...personalEventsConditions));

      formattedMemberEvents = dbPersonalEvents.map((row) => {
        const isOwner = row.username === requestingUsername;
        const isPrivate = !row.public;

        const isoDate = row.date;
        const formattedStartTime = row.startTime.toISOString();
        const formattedEndTime = row.endTime.toISOString();

        if (isPrivate && !isOwner) {
          // Mask private events for other users
          return {
            id: row.id!,
            username: row.username!,
            date: isoDate,
            location: null,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            repeat: row.repeat,
            public: false,
            title: "Busy",
            description: null,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
          };
        } else {
          // Keep intact for own events or public events
          return {
            id: row.id!,
            username: row.username!,
            date: isoDate,
            location: row.location,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            repeat: row.repeat,
            public: row.public,
            title: row.title,
            description: row.description,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
          };
        }
      });
    }

    const payload = {
      groupEvents: formattedGroupEvents,
      memberEvents: formattedMemberEvents,
    };

    const checkSchema = Value.Convert(groupCalendarDTO, payload);
    if (Value.Check(groupCalendarDTO, checkSchema)) {
      return Ok(checkSchema as GroupCalendarDTO);
    } else {
      app.log.error(Value.Errors(groupCalendarDTO, checkSchema));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(error as any, "Failed to query group calendar");
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * This method fetches the personal events, between the two given dates, of a user 
 * with the provided username. It converts the events to an array of personalEventDTOs 
 * and returns them. If the user is not found, it returns an UnknownUsernameError. If 
 * there is an error converting the events' data, it returns a ConversionError. 
 * 
 * @param username username of the user 
 * @param startDate date where the event fecthing starts
 * @param endDate date where the event fecthing ends
 * @returns a promised result with an array of personalEventDTO, or an error
 */
export const getUserEvents = async( username: string, startDate: string, endDate: string ):
Promise<Result<PersonalEventDTO[], ErrorTypes.ConversionError | ErrorTypes.UnknownUsernameError>> => {

  const personalEvents = await db.query.personalEvents.findMany({
    where: {
      username: username,
      date: {
        gte: startDate,
        lte: endDate,
      }
    },
    with: {
      events: true,
    }
  });

  if(personalEvents){
    const sanitizedEvents = []
    for(const personalEvent of personalEvents){
      const {events, ...rest} = personalEvent;
      
      if(events){

        const sanitizedEvent = {
          ...rest,
          id: events.id,
          title: events.title,
          description: events.description,
          createdAt: events.createdAt.toISOString(),
          updatedAt: events.updatedAt.toISOString(),
          startTime: rest.startTime.toISOString(),
          endTime: rest.endTime.toISOString()
        };

        app.log.info(`DATE: ${rest.date}`)
        app.log.info(`START TIME: ${rest.startTime}`)
        app.log.info(`END TIME: ${rest.endTime}`)
        sanitizedEvents.push(sanitizedEvent);
      }
    }

    const check = Type.Array(personalEventDTO);
    const converted = Value.Convert(check, sanitizedEvents);
    if(Value.Check(check, converted)){
      return Ok(converted);
    }
    else{
      app.log.error(Value.Errors(check, converted));
      return Err(ErrorTypes.ConversionError);
    }
  }
  else{
    app.log.warn(`User with username ${username} not found`);
    return Err(ErrorTypes.UnknownUsernameError);
  }
};