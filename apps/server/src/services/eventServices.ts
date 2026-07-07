import {
  eventConfirmations,
  events,
  groupEvents,
  groupEventsFinal,
  groupMembers,
  groups,
  personalEvents,
  plans,
} from "@baza/db/schemas";
import {
  type CreateEventBody,
  type CreatePersonalEventBody,
  type EditEventBody,
  type EditPersonalEventBody,
  Err,
  ErrorTypes,
  eventConfirmationDTO,
  type EventConfirmationDTO,
  groupCalendarDTO,
  type GroupCalendarDTO,
  groupEventDTO,
  type GroupEventDTO,
  Ok,
  personalEventDTO,
  type PersonalEventDTO,
  type Result,
} from "@baza/shared-types";
import { and, eq, gte, inArray, isNull, lte, ne, or } from "drizzle-orm";
import { Type } from "typebox";
import { Value } from "typebox/value";
import { db } from "../lib/db";
import { app } from "../setup";
import { expandRepeatingEvents } from "../utils/eventUtils";
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
  body: CreateEventBody,
): Promise<
  Result<
    GroupEventDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.ResourceCreationError
    | ErrorTypes.MalformedRequestError
  >
> => {
  try {
    const startDateVal = new Date(body.startDate);
    const votingEndTimeVal = new Date(body.votingEndTime);

    if (votingEndTimeVal >= startDateVal) {
      app.log.warn(
        `Create event constraint violated: votingEndTime (${body.votingEndTime}) must be earlier than startDate (${body.startDate})`,
      );
      return Err(ErrorTypes.MalformedRequestError);
    }

    const created = await db.transaction(async (tx) => {
      const [newEvent] = await tx
        .insert(events)
        .values({
          title: body.title,
          description: body.description,
        })
        .returning();

      if (!newEvent) {
        throw new Error("Failed to insert base event");
      }

      const [newGroupEvent] = await tx
        .insert(groupEvents)
        .values({
          id: newEvent.id,
          groupId: groupId,
          startDate: body.startDate,
          endDate: body.endDate,
          state: "unfinished",
          votingEndTime: new Date(body.votingEndTime),
          createdBy: creatorUsername,
        })
        .returning();

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
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to create group event",
    );
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
  endDate?: string,
): Promise<Result<GroupEventDTO[], ErrorTypes.ConversionError>> => {
  try {
    const conditions = [eq(groupEvents.groupId, groupId)];
    if (startDate) {
      conditions.push(gte(groupEvents.startDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(groupEvents.endDate, endDate));
    }

    const query = db
      .select({
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
        winningPlanId: groupEventsFinal.planId,
        winningPlan: {
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
        },
      })
      .from(groupEvents)
      .innerJoin(events, eq(groupEvents.id, events.id))
      .leftJoin(groupEventsFinal, eq(groupEvents.id, groupEventsFinal.id))
      .leftJoin(plans, eq(groupEventsFinal.planId, plans.id))
      .where(and(...conditions));

    const unfinishedEvents = await db
      .select()
      .from(groupEvents)
      .where(
        and(
          eq(groupEvents.groupId, groupId),
          eq(groupEvents.state, "unfinished"),
          lte(groupEvents.votingEndTime, new Date()),
        ),
      );

    for (const ge of unfinishedEvents) {
      await finalizeEvent(ge.id);
    }

    const rows = await query;

    const formatted = rows.map((row) => {
      let winningPlan: any = null;
      if (row.winningPlanId && row.winningPlan && row.winningPlan.id) {
        winningPlan = {
          ...row.winningPlan,
          startTime: row.winningPlan.startTime.includes("Z")
            ? row.winningPlan.startTime
            : `${row.winningPlan.startTime}Z`,
          endTime: row.winningPlan.endTime.includes("Z")
            ? row.winningPlan.endTime
            : `${row.winningPlan.endTime}Z`,
          createdAt: row.winningPlan.createdAt.toISOString(),
          updatedAt: row.winningPlan.updatedAt.toISOString(),
        };
      }

      return {
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
        winningPlan,
      };
    });

    const checkSchema = Value.Convert(Type.Array(groupEventDTO), formatted);
    if (Value.Check(Type.Array(groupEventDTO), checkSchema)) {
      return Ok(checkSchema as GroupEventDTO[]);
    } else {
      app.log.error(Value.Errors(Type.Array(groupEventDTO), checkSchema));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to query group events",
    );
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
  eventId: string,
): Promise<
  Result<GroupEventDTO, ErrorTypes.ConversionError | ErrorTypes.UnknownIdError>
> => {
  try {
    const [eventRecord] = await db
      .select()
      .from(groupEvents)
      .where(eq(groupEvents.id, eventId))
      .limit(1);

    if (
      eventRecord &&
      eventRecord.state === "unfinished" &&
      eventRecord.votingEndTime &&
      new Date() >= new Date(eventRecord.votingEndTime)
    ) {
      await finalizeEvent(eventId);
    }

    const rows = await db
      .select({
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
        winningPlanId: groupEventsFinal.planId,
        winningPlan: {
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
        },
      })
      .from(groupEvents)
      .innerJoin(events, eq(groupEvents.id, events.id))
      .leftJoin(groupEventsFinal, eq(groupEvents.id, groupEventsFinal.id))
      .leftJoin(plans, eq(groupEventsFinal.planId, plans.id))
      .where(
        and(eq(groupEvents.groupId, groupId), eq(groupEvents.id, eventId)),
      );

    if (rows.length === 1) {
      const row = rows[0]!;
      let winningPlan: any = null;
      if (row.winningPlanId && row.winningPlan && row.winningPlan.id) {
        winningPlan = {
          ...row.winningPlan,
          startTime: row.winningPlan.startTime.includes("Z")
            ? row.winningPlan.startTime
            : `${row.winningPlan.startTime}Z`,
          endTime: row.winningPlan.endTime.includes("Z")
            ? row.winningPlan.endTime
            : `${row.winningPlan.endTime}Z`,
          createdAt: row.winningPlan.createdAt.toISOString(),
          updatedAt: row.winningPlan.updatedAt.toISOString(),
        };
      }

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
        winningPlan,
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
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to query group event by ID",
    );
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
  body: EditEventBody,
): Promise<
  Result<
    GroupEventDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.UnknownIdError
    | ErrorTypes.MalformedRequestError
    | ErrorTypes.UpdateError
  >
> => {
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
        app.log.warn(
          `Edit event constraint violated: votingEndTime (${body.votingEndTime}) must be earlier than startDate (${eventRecord.startDate})`,
        );
        return Err(ErrorTypes.MalformedRequestError);
      }
    }

    await db.transaction(async (tx) => {
      if (body.title !== undefined || body.description !== undefined) {
        await tx
          .update(events)
          .set({
            title: body.title,
            description: body.description,
            updatedAt: new Date(),
          })
          .where(eq(events.id, eventId));
      }

      if (body.votingEndTime !== undefined) {
        await tx
          .update(groupEvents)
          .set({
            votingEndTime: new Date(body.votingEndTime),
          })
          .where(eq(groupEvents.id, eventId));
      }
    });

    return getGroupEventById(groupId, eventId);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to edit group event",
    );
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
  startDate: string,
  endDate: string,
): Promise<
  Result<
    GroupCalendarDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.UnauthorizedError
    | ErrorTypes.UnknownIdError
  >
> => {
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
          eq(groupMembers.banned, false),
        ),
      )
      .limit(1);

    if (!requesterMember) {
      app.log.warn(
        `GetGroupCalendar: Access denied for user ${requestingUsername} in group ${groupId}`,
      );
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
          eq(groupMembers.banned, false),
        ),
      );

    const memberUsernames = members.map((m) => m.username);

    // 4. Fetch group events within the date range
    const groupEventsConditions = [
      eq(groupEvents.groupId, groupId),
      gte(groupEvents.startDate, startDate),
      lte(groupEvents.endDate, endDate),
    ];

    const dbGroupEvents = await db
      .select({
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
      const personalEventsConditions = [
        inArray(personalEvents.username, memberUsernames),
        or(
          and(
            gte(personalEvents.date, startDate),
            lte(personalEvents.date, endDate),
          ),
          and(
            ne(personalEvents.repeat, "never"),
            or(
              isNull(personalEvents.repeatUntil),
              gte(personalEvents.repeatUntil, startDate),
            ),
          ),
        ),
      ];

      const dbPersonalEvents = await db
        .select({
          id: personalEvents.id,
          username: personalEvents.username,
          date: personalEvents.date,
          location: personalEvents.location,
          startTime: personalEvents.startTime,
          endTime: personalEvents.endTime,
          allDay: personalEvents.allDay,
          repeat: personalEvents.repeat,
          repeatUntil: personalEvents.repeatUntil,
          public: personalEvents.public,
          title: events.title,
          description: events.description,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
        })
        .from(personalEvents)
        .innerJoin(events, eq(personalEvents.id, events.id))
        .where(and(...personalEventsConditions));

      const expandedPersonalEvents = dbPersonalEvents.flatMap((row) =>
        expandRepeatingEvents(
          {
            ...row,
            startTime: row.startTime.toISOString(),
            endTime: row.endTime.toISOString(),
          },
          startDate,
          endDate,
        ),
      );

      formattedMemberEvents = expandedPersonalEvents.map((row) => {
        const isOwner = row.username === requestingUsername;
        const isPrivate = !row.public;

        const isoDate = row.date;
        const formattedStartTime = row.startTime;
        const formattedEndTime = row.endTime;

        if (isPrivate && !isOwner) {
          // Mask private events for other users
          return {
            id: row.id!,
            username: row.username!,
            date: isoDate,
            location: null,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            allDay: row.allDay,
            repeat: row.repeat,
            repeatUntil: row.repeatUntil,
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
            allDay: row.allDay,
            repeat: row.repeat,
            repeatUntil: row.repeatUntil,
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
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to query group calendar",
    );
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
export const getUserEvents = async (
  username: string,
  startDate: string,
  endDate: string,
): Promise<
  Result<
    PersonalEventDTO[],
    ErrorTypes.ConversionError | ErrorTypes.UnknownUsernameError
  >
> => {
  const fetchedPersonalEvents = await db.query.personalEvents.findMany({
    where: {
      username,
      OR: [
        {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          AND: [
            { repeat: { ne: "never" } },
            {
              OR: [
                { repeatUntil: { isNull: true } },
                { repeatUntil: { gte: startDate } },
              ],
            },
          ],
        },
      ],
    },
    with: {
      events: true,
    },
  });

  if (fetchedPersonalEvents) {
    const sanitizedEvents = [];
    for (const personalEvent of fetchedPersonalEvents) {
      const { events, ...rest } = personalEvent;

      if (events) {
        const sanitizedEvent = {
          ...rest,
          id: events.id,
          title: events.title,
          description: events.description,
          createdAt: events.createdAt.toISOString(),
          updatedAt: events.updatedAt.toISOString(),
          startTime: rest.startTime.toISOString(),
          endTime: rest.endTime.toISOString(),
        };

        app.log.info(`DATE: ${rest.date}`);
        app.log.info(`START TIME: ${rest.startTime}`);
        app.log.info(`END TIME: ${rest.endTime}`);
        sanitizedEvents.push(sanitizedEvent);
      }
    }

    const expandedEvents = sanitizedEvents.flatMap((event) =>
      expandRepeatingEvents(event, startDate, endDate),
    );

    const check = Type.Array(personalEventDTO);
    const converted = Value.Convert(check, expandedEvents);
    if (Value.Check(check, converted)) {
      return Ok(converted);
    } else {
      app.log.error(Value.Errors(check, converted));
      return Err(ErrorTypes.ConversionError);
    }
  } else {
    app.log.warn(`User with username ${username} not found`);
    return Err(ErrorTypes.UnknownUsernameError);
  }
};

/**
 * Fetches a single personal event by username and event ID.
 */
export const getPersonalEventById = async (
  username: string,
  eventId: string,
): Promise<
  Result<
    PersonalEventDTO,
    ErrorTypes.ConversionError | ErrorTypes.UnknownIdError
  >
> => {
  try {
    const record = await db.query.personalEvents.findFirst({
      where: { id: eventId, username: username },
      with: {
        events: true,
      },
    });

    if (!record || !record.events) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const formatted = {
      id: record.events.id,
      username: record.username,
      title: record.events.title,
      description: record.events.description,
      date: record.date,
      location: record.location,
      startTime: record.startTime.toISOString(),
      endTime: record.endTime.toISOString(),
      allDay: record.allDay,
      repeat: record.repeat,
      repeatUntil: record.repeatUntil,
      public: record.public,
      createdAt: record.events.createdAt.toISOString(),
      updatedAt: record.events.updatedAt.toISOString(),
    };

    const conv = Value.Convert(personalEventDTO, formatted);
    if (Value.Check(personalEventDTO, conv)) {
      return Ok(conv);
    } else {
      app.log.error(Value.Errors(personalEventDTO, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to query personal event by ID",
    );
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * Creates a personal event.
 */
export const createPersonalEvent = async (
  username: string,
  body: CreatePersonalEventBody,
): Promise<
  Result<
    PersonalEventDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.ResourceCreationError
    | ErrorTypes.MalformedRequestError
  >
> => {
  try {
    const isAllDay = !!body.allDay;
    let startTimeVal: Date;
    let endTimeVal: Date;

    if (isAllDay) {
      startTimeVal = new Date(`${body.date}T00:00:00.000Z`);
      endTimeVal = new Date(`${body.date}T23:59:59.999Z`);
    } else {
      if (!body.startTime || !body.endTime) {
        app.log.warn(
          "Create personal event: startTime and endTime are required when allDay is false",
        );
        return Err(ErrorTypes.MalformedRequestError);
      }
      startTimeVal = new Date(body.startTime);
      endTimeVal = new Date(body.endTime);
    }

    if (startTimeVal >= endTimeVal) {
      app.log.warn(
        `Create personal event constraint violated: startTime (${body.startTime || startTimeVal.toISOString()}) must be earlier than endTime (${body.endTime || endTimeVal.toISOString()})`,
      );
      return Err(ErrorTypes.MalformedRequestError);
    }

    if (body.repeatUntil && new Date(body.repeatUntil) < new Date(body.date)) {
      app.log.warn(
        `Create personal event constraint violated: repeatUntil (${body.repeatUntil}) cannot be earlier than event date (${body.date})`,
      );
      return Err(ErrorTypes.MalformedRequestError);
    }

    const created = await db.transaction(async (tx) => {
      const [newEvent] = await tx
        .insert(events)
        .values({
          title: body.title,
          description: body.description,
        })
        .returning();

      if (!newEvent) {
        throw new Error("Failed to insert base event");
      }

      const [newPersonalEvent] = await tx
        .insert(personalEvents)
        .values({
          id: newEvent.id,
          username: username,
          date: body.date,
          location: body.location ?? null,
          startTime: startTimeVal,
          endTime: endTimeVal,
          allDay: isAllDay,
          repeat: body.repeat,
          repeatUntil: body.repeatUntil ?? null,
          public: body.public,
        })
        .returning();

      if (!newPersonalEvent) {
        throw new Error("Failed to insert personal event");
      }

      return {
        id: newEvent.id,
        username: username,
        title: newEvent.title,
        description: newEvent.description,
        date: newPersonalEvent.date,
        location: newPersonalEvent.location,
        startTime: newPersonalEvent.startTime.toISOString(),
        endTime: newPersonalEvent.endTime.toISOString(),
        allDay: newPersonalEvent.allDay,
        repeat: newPersonalEvent.repeat,
        repeatUntil: newPersonalEvent.repeatUntil,
        public: newPersonalEvent.public,
        createdAt: newEvent.createdAt.toISOString(),
        updatedAt: newEvent.updatedAt.toISOString(),
      };
    });

    if (created) {
      const conv = Value.Convert(personalEventDTO, created);
      if (Value.Check(personalEventDTO, conv)) {
        return Ok(conv);
      } else {
        app.log.error(Value.Errors(personalEventDTO, conv));
        return Err(ErrorTypes.ConversionError);
      }
    } else {
      return Err(ErrorTypes.ResourceCreationError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to create personal event",
    );
    return Err(ErrorTypes.ResourceCreationError);
  }
};

/**
 * Modifies an existing personal event.
 */
export const editPersonalEvent = async (
  username: string,
  eventId: string,
  body: EditPersonalEventBody,
): Promise<
  Result<
    PersonalEventDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.UnknownIdError
    | ErrorTypes.MalformedRequestError
    | ErrorTypes.UpdateError
  >
> => {
  try {
    const existing = await db.query.personalEvents.findFirst({
      where: { id: eventId, username: username },
    });

    if (!existing) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const isAllDay = body.allDay !== undefined ? body.allDay : existing.allDay;
    const eventDate = body.date !== undefined ? body.date : existing.date;

    let startTimeVal: Date;
    let endTimeVal: Date;

    if (isAllDay) {
      startTimeVal = new Date(`${eventDate}T00:00:00.000Z`);
      endTimeVal = new Date(`${eventDate}T23:59:59.999Z`);
    } else {
      const startTimeStr =
        body.startTime !== undefined
          ? body.startTime
          : existing.startTime.toISOString();
      const endTimeStr =
        body.endTime !== undefined
          ? body.endTime
          : existing.endTime.toISOString();
      startTimeVal = new Date(startTimeStr);
      endTimeVal = new Date(endTimeStr);
    }

    if (startTimeVal >= endTimeVal) {
      app.log.warn(
        `Edit personal event constraint violated: startTime (${startTimeVal.toISOString()}) must be earlier than endTime (${endTimeVal.toISOString()})`,
      );
      return Err(ErrorTypes.MalformedRequestError);
    }

    const repeatUntilStr =
      body.repeatUntil !== undefined ? body.repeatUntil : existing.repeatUntil;
    if (repeatUntilStr && new Date(repeatUntilStr) < new Date(eventDate)) {
      app.log.warn(
        `Edit personal event constraint violated: repeatUntil (${repeatUntilStr}) cannot be earlier than event date (${eventDate})`,
      );
      return Err(ErrorTypes.MalformedRequestError);
    }

    await db.transaction(async (tx) => {
      if (body.title !== undefined || body.description !== undefined) {
        await tx
          .update(events)
          .set({
            title: body.title,
            description: body.description,
            updatedAt: new Date(),
          })
          .where(eq(events.id, eventId));
      }

      const updateValues: Record<string, any> = {};
      if (body.date !== undefined) updateValues.date = body.date;
      if (body.location !== undefined) updateValues.location = body.location;

      updateValues.startTime = startTimeVal;
      updateValues.endTime = endTimeVal;

      if (body.allDay !== undefined) updateValues.allDay = body.allDay;
      if (body.repeat !== undefined) updateValues.repeat = body.repeat;
      if (body.repeatUntil !== undefined)
        updateValues.repeatUntil = body.repeatUntil;
      if (body.public !== undefined) updateValues.public = body.public;

      if (Object.keys(updateValues).length > 0) {
        await tx
          .update(personalEvents)
          .set(updateValues)
          .where(
            and(
              eq(personalEvents.id, eventId),
              eq(personalEvents.username, username),
            ),
          );
      }
    });

    return getPersonalEventById(username, eventId);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to edit personal event",
    );
    return Err(ErrorTypes.UpdateError);
  }
};

/**
 * Confirms a member's attendance to a group event.
 */
export const confirmEventAttendance = async (
  eventId: string,
  groupId: string,
  username: string,
  confirmedAt: string,
): Promise<
  Result<
    EventConfirmationDTO,
    ErrorTypes.ResourceCreationError | ErrorTypes.ConversionError
  >
> => {
  try {
    const [inserted] = await db
      .insert(eventConfirmations)
      .values({
        eventId,
        groupId,
        username,
        confirmedAt: new Date(confirmedAt),
      })
      .onConflictDoUpdate({
        target: [eventConfirmations.eventId, eventConfirmations.username],
        set: { confirmedAt: new Date(confirmedAt) },
      })
      .returning();

    if (!inserted) {
      return Err(ErrorTypes.ResourceCreationError);
    }

    const formatted = {
      ...inserted,
      confirmedAt: inserted.confirmedAt.toISOString(),
    };

    const conv = Value.Convert(eventConfirmationDTO, formatted);
    if (Value.Check(eventConfirmationDTO, conv)) {
      return Ok(conv);
    } else {
      app.log.error(Value.Errors(eventConfirmationDTO, conv));
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to confirm event attendance",
    );
    return Err(ErrorTypes.ResourceCreationError);
  }
};

/**
 * Revokes a member's attendance confirmation.
 */
export const revokeEventAttendance = async (
  eventId: string,
  username: string,
): Promise<
  Result<null, ErrorTypes.DeleteError | ErrorTypes.UnknownIdError>
> => {
  try {
    const deleted = await db
      .delete(eventConfirmations)
      .where(
        and(
          eq(eventConfirmations.eventId, eventId),
          eq(eventConfirmations.username, username),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      return Err(ErrorTypes.UnknownIdError);
    }

    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to revoke event attendance confirmation",
    );
    return Err(ErrorTypes.DeleteError);
  }
};

/**
 * Lists all attendance confirmations for a group event.
 */
export const getEventConfirmations = async (
  eventId: string,
): Promise<Result<EventConfirmationDTO[], ErrorTypes.ConversionError>> => {
  try {
    const rows = await db
      .select()
      .from(eventConfirmations)
      .where(eq(eventConfirmations.eventId, eventId));

    const formattedRows = rows.map((r) => ({
      ...r,
      confirmedAt: r.confirmedAt.toISOString(),
    }));

    const checkSchema = Value.Convert(
      Type.Array(eventConfirmationDTO),
      formattedRows,
    );
    if (Value.Check(Type.Array(eventConfirmationDTO), checkSchema)) {
      return Ok(checkSchema as EventConfirmationDTO[]);
    } else {
      app.log.error(
        Value.Errors(Type.Array(eventConfirmationDTO), checkSchema),
      );
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to retrieve event confirmations",
    );
    return Err(ErrorTypes.ConversionError);
  }
};

/**
 * Deletes a personal event.
 */
export const deletePersonalEvent = async (
  idEvent: string,
  username: string,
): Promise<
  Result<null, ErrorTypes.DeleteError | ErrorTypes.UnknownIdError>
> => {
  try {
    const deleted = await db.transaction(async (tx) => {
      const deletedPersonal = await tx
        .delete(personalEvents)
        .where(
          and(
            eq(personalEvents.id, idEvent),
            eq(personalEvents.username, username),
          ),
        )
        .returning();

      if (deletedPersonal.length === 0) return null;

      await tx.delete(events).where(eq(events.id, idEvent));
      return deletedPersonal;
    });

    if (!deleted) {
      return Err(ErrorTypes.UnknownIdError);
    }
    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to delete personal event",
    );
    return Err(ErrorTypes.DeleteError);
  }
};

/**
 * Deletes a group event.
 */
export const deleteGroupEvent = async (
  idEvent: string,
  groupId: string,
): Promise<
  Result<null, ErrorTypes.DeleteError | ErrorTypes.UnknownIdError>
> => {
  try {
    const deleted = await db.transaction(async (tx) => {
      const deletedGroupEvent = await tx
        .delete(groupEvents)
        .where(
          and(eq(groupEvents.id, idEvent), eq(groupEvents.groupId, groupId)),
        )
        .returning();

      if (deletedGroupEvent.length === 0) return null;

      await tx.delete(events).where(eq(events.id, idEvent));
      return deletedGroupEvent;
    });

    if (!deleted) {
      return Err(ErrorTypes.UnknownIdError);
    }
    return Ok(null);
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to delete group event",
    );
    return Err(ErrorTypes.DeleteError);
  }
};
