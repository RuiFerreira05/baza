import { groupEvents, groupMembers, preferences } from "@baza/db/schemas";
import {
  Err,
  ErrorTypes,
  groupPreferenceReportDTO,
  Ok,
  preferenceDTO,
  type CreatePreferenceBody,
  type GroupPreferenceReportDTO,
  type PreferenceDTO,
  type Result,
} from "@baza/shared-types";
import { and, eq } from "drizzle-orm";
import { Type } from "typebox";
import { Value } from "typebox/value";
import { db } from "../lib/db";
import { app } from "../setup";

export const createOrEditEventPreference = async (
  groupId: string,
  eventId: string,
  username: string,
  body: CreatePreferenceBody,
): Promise<
  Result<
    PreferenceDTO,
    | ErrorTypes.ConversionError
    | ErrorTypes.ResourceCreationError
    | ErrorTypes.UnknownIdError
    | ErrorTypes.MalformedRequestError
  >
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);
    if (!event) return Err(ErrorTypes.UnknownIdError);

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
          eq(groupMembers.username, username),
        ),
      )
      .limit(1);
    if (!member) return Err(ErrorTypes.UnknownIdError);

    const [existing] = await db
      .select()
      .from(preferences)
      .where(
        and(
          eq(preferences.groupEventId, eventId),
          eq(preferences.username, username),
        ),
      )
      .limit(1);

    let record;
    if (existing) {
      const [updated] = await db
        .update(preferences)
        .set({
          preference: body.preference,
          private: body.private,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(preferences.groupEventId, eventId),
            eq(preferences.username, username),
          ),
        )
        .returning();
      record = updated;
    } else {
      const [inserted] = await db
        .insert(preferences)
        .values({
          groupEventId: eventId,
          username: username,
          preference: body.preference,
          private: body.private,
        })
        .returning();
      record = inserted;
    }

    if (record) {
      const formatted = {
        ...record,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
      const conv = Value.Convert(preferenceDTO, formatted);
      if (Value.Check(preferenceDTO, conv)) {
        return Ok(conv);
      } else {
        const errorArray = Array.from(Value.Errors(preferenceDTO, conv));
        app.log.error(
          { errors: errorArray },
          "Conversion check failed for preferenceDTO",
        );
        return Err(ErrorTypes.ConversionError);
      }
    } else {
      return Err(ErrorTypes.ResourceCreationError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to save preference",
    );
    return Err(ErrorTypes.ResourceCreationError);
  }
};

export const getEventPreferenceByUsername = async (
  groupId: string,
  eventId: string,
  username: string,
  requesterUsername: string,
): Promise<
  Result<PreferenceDTO, ErrorTypes.ConversionError | ErrorTypes.UnknownIdError>
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);
    if (!event) return Err(ErrorTypes.UnknownIdError);

    const [record] = await db
      .select()
      .from(preferences)
      .where(
        and(
          eq(preferences.groupEventId, eventId),
          eq(preferences.username, username),
        ),
      )
      .limit(1);

    if (!record) return Err(ErrorTypes.UnknownIdError);

    if (record.private && record.username !== requesterUsername) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const formatted = {
      ...record,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };

    const conv = Value.Convert(preferenceDTO, formatted);
    if (Value.Check(preferenceDTO, conv)) {
      return Ok(conv);
    } else {
      const errorArray = Array.from(Value.Errors(preferenceDTO, conv));
      app.log.error(
        { errors: errorArray },
        "Conversion check failed for preferenceDTO",
      );
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to query user preference",
    );
    return Err(ErrorTypes.UnknownIdError);
  }
};

export const getEventPreferences = async (
  groupId: string,
  eventId: string,
  requesterUsername: string,
): Promise<
  Result<
    PreferenceDTO[],
    ErrorTypes.ConversionError | ErrorTypes.UnknownIdError
  >
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);
    if (!event) return Err(ErrorTypes.UnknownIdError);

    const list = await db
      .select()
      .from(preferences)
      .where(eq(preferences.groupEventId, eventId));

    const filtered = list.filter(
      (item) => !item.private || item.username === requesterUsername,
    );

    const formatted = filtered.map((record) => ({
      ...record,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    }));

    const checkSchema = Value.Convert(Type.Array(preferenceDTO), formatted);
    if (Value.Check(Type.Array(preferenceDTO), checkSchema)) {
      return Ok(checkSchema as PreferenceDTO[]);
    } else {
      const errorArray = Array.from(
        Value.Errors(Type.Array(preferenceDTO), checkSchema),
      );
      app.log.error(
        { errors: errorArray },
        "Conversion check failed for Array(preferenceDTO)",
      );
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to query preferences",
    );
    return Err(ErrorTypes.ConversionError);
  }
};

export const getGroupPreferenceAggregation = async (
  groupId: string,
  eventId: string,
): Promise<
  Result<
    GroupPreferenceReportDTO,
    ErrorTypes.ConversionError | ErrorTypes.UnknownIdError
  >
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);
    if (!event) return Err(ErrorTypes.UnknownIdError);

    const list = await db
      .select()
      .from(preferences)
      .where(eq(preferences.groupEventId, eventId));

    const totalResponses = list.length;
    const dateAvailability: Record<string, number> = {};
    const preferredActivities: Record<string, number> = {};

    let overlappingMinBudget: number | null = null;
    let overlappingMaxBudget: number | null = null;

    for (const record of list) {
      const pref = record.preference as
        | {
            availableDates?: string[];
            activities?: string[];
            minBudget?: number;
            maxBudget?: number;
          }
        | null
        | undefined;
      if (!pref) continue;

      if (Array.isArray(pref.availableDates)) {
        for (const d of pref.availableDates) {
          if (typeof d === "string") {
            dateAvailability[d] = (dateAvailability[d] ?? 0) + 1;
          }
        }
      }

      if (Array.isArray(pref.activities)) {
        for (const a of pref.activities) {
          if (typeof a === "string") {
            preferredActivities[a] = (preferredActivities[a] ?? 0) + 1;
          }
        }
      }

      if (typeof pref.minBudget === "number") {
        if (
          overlappingMinBudget === null ||
          pref.minBudget > overlappingMinBudget
        ) {
          overlappingMinBudget = pref.minBudget;
        }
      }
      if (typeof pref.maxBudget === "number") {
        if (
          overlappingMaxBudget === null ||
          pref.maxBudget < overlappingMaxBudget
        ) {
          overlappingMaxBudget = pref.maxBudget;
        }
      }
    }

    if (
      overlappingMinBudget !== null &&
      overlappingMaxBudget !== null &&
      overlappingMinBudget > overlappingMaxBudget
    ) {
      overlappingMinBudget = null;
      overlappingMaxBudget = null;
    }

    const report = {
      totalResponses,
      dateAvailability,
      preferredActivities,
      budgetRange: {
        min: overlappingMinBudget,
        max: overlappingMaxBudget,
      },
    };

    const conv = Value.Convert(groupPreferenceReportDTO, report);
    if (Value.Check(groupPreferenceReportDTO, conv)) {
      return Ok(conv);
    } else {
      const errorArray = Array.from(
        Value.Errors(groupPreferenceReportDTO, conv),
      );
      app.log.error(
        { errors: errorArray },
        "Conversion check failed for groupPreferenceReportDTO",
      );
      return Err(ErrorTypes.ConversionError);
    }
  } catch (error) {
    app.log.error(
      error instanceof Error ? error : new Error(String(error)),
      "Failed to aggregate group preferences",
    );
    return Err(ErrorTypes.ConversionError);
  }
};
