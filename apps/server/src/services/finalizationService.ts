import { db } from "../lib/db";
import { groupEvents, groupEventsFinal, plans, votes } from "@baza/db/schemas";
import { eq, and, sql, asc, lte } from "drizzle-orm";
import { app } from "../setup";
import { ErrorTypes } from "@baza/shared-types";
import { Err, Ok, type Result } from "../lib/types";

export const finalizeExpiredEvents = async () => {
  app.log.info("Running automated group event finalization engine...");
  try {
    const now = new Date();
    const expiredEvents = await db
      .select({ id: groupEvents.id })
      .from(groupEvents)
      .where(
        and(
          eq(groupEvents.state, "unfinished"),
          lte(groupEvents.votingEndTime, now),
        ),
      );

    const batchSize = 50;
    for (let i = 0; i < expiredEvents.length; i += batchSize) {
      const batch = expiredEvents.slice(i, i + batchSize);
      await Promise.all(batch.map((event) => finalizeEvent(event.id)));
    }
  } catch (error) {
    app.log.error(
      error as any,
      "Error in finalizeExpiredEvents background task",
    );
  }
};

export const checkAndApplyFallbacks = async () => {
  app.log.info(
    "Checking for expired tie-breakers (creator decision deadlines)...",
  );
  try {
    const tiebreakerEvents = await db
      .select({
        id: groupEvents.id,
        votingEndTime: groupEvents.votingEndTime,
        startDate: groupEvents.startDate,
      })
      .from(groupEvents)
      .where(eq(groupEvents.state, "needs_tiebreaker"));

    const now = new Date();
    const toResolve = [];

    for (const event of tiebreakerEvents) {
      if (!event.votingEndTime) continue;

      const votingEnd = new Date(event.votingEndTime);
      const start = new Date(event.startDate);

      const fallbackDeadline = new Date(
        Math.min(votingEnd.getTime() + 24 * 60 * 60 * 1000, start.getTime()),
      );

      if (now >= fallbackDeadline) {
        toResolve.push(event.id);
      }
    }

    const batchSize = 50;
    for (let i = 0; i < toResolve.length; i += batchSize) {
      const batch = toResolve.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (id) => {
          app.log.info(
            `Event ${id} fallback deadline reached. Applying automated tie-breaker...`,
          );
          await applyFallbackResolution(id);
        }),
      );
    }
  } catch (error) {
    app.log.error(
      error as any,
      "Error in checkAndApplyFallbacks background task",
    );
  }
};

export const finalizeEvent = async (eventId: string): Promise<void> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(eq(groupEvents.id, eventId))
      .limit(1);

    if (!event || event.state !== "unfinished") return;

    const plansWithVotes = await db
      .select({
        id: plans.id,
        groupEventId: plans.groupEventId,
        username: plans.username,
        title: plans.title,
        date: plans.date,
        startTime: plans.startTime,
        endTime: plans.endTime,
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
      .groupBy(plans.id)
      .orderBy(asc(plans.createdAt));

    if (plansWithVotes.length === 0) {
      await db
        .update(groupEvents)
        .set({ state: "finished" })
        .where(eq(groupEvents.id, eventId));
      app.log.info(`Event ${eventId} finalized with no plan proposed.`);
      return;
    }

    const maxVotes = Math.max(...plansWithVotes.map((p) => p.votesCount));
    const tiedPlans = plansWithVotes.filter((p) => p.votesCount === maxVotes);

    if (tiedPlans.length === 1) {
      const winner = tiedPlans[0]!;
      await db.transaction(async (tx) => {
        await tx.insert(groupEventsFinal).values({
          id: eventId,
          groupId: event.groupId!,
          planId: winner.id,
        });
        await tx
          .update(groupEvents)
          .set({ state: "finished" })
          .where(eq(groupEvents.id, eventId));
      });
      app.log.info(
        `Event ${eventId} finalized automatically. Winner: ${winner.id} with ${maxVotes} votes.`,
      );
    } else {
      await db
        .update(groupEvents)
        .set({ state: "needs_tiebreaker" })
        .where(eq(groupEvents.id, eventId));
      app.log.info(
        `Event ${eventId} entered needs_tiebreaker state (tie between ${tiedPlans.length} plans).`,
      );
    }
  } catch (error) {
    app.log.error(error as any, `Failed to finalize event ${eventId}`);
  }
};

const applyFallbackResolution = async (eventId: string): Promise<void> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(eq(groupEvents.id, eventId))
      .limit(1);

    if (!event || event.state !== "needs_tiebreaker") return;

    const plansWithVotes = await db
      .select({
        id: plans.id,
        votesCount: sql<number>`count(${votes.username})::int`,
      })
      .from(plans)
      .leftJoin(votes, eq(plans.id, votes.planId))
      .where(eq(plans.groupEventId, eventId))
      .groupBy(plans.id, plans.createdAt)
      .orderBy(asc(plans.createdAt));

    const maxVotes =
      plansWithVotes.length > 0
        ? Math.max(...plansWithVotes.map((p) => p.votesCount))
        : 0;
    const tiedPlans = plansWithVotes.filter((p) => p.votesCount === maxVotes);

    if (tiedPlans.length > 0) {
      const earliestTiedPlan = tiedPlans[0]!;
      await db.transaction(async (tx) => {
        await tx.insert(groupEventsFinal).values({
          id: eventId,
          groupId: event.groupId!,
          planId: earliestTiedPlan.id,
        });
        await tx
          .update(groupEvents)
          .set({ state: "finished" })
          .where(eq(groupEvents.id, eventId));
      });
      app.log.info(
        `Event ${eventId} tie-breaker resolved automatically via fallback (earliest proposal). Winner: ${earliestTiedPlan.id}`,
      );
    } else {
      await db
        .update(groupEvents)
        .set({ state: "finished" })
        .where(eq(groupEvents.id, eventId));
      app.log.info(
        `Event ${eventId} tie-breaker closed automatically via fallback with no proposals.`,
      );
    }
  } catch (error) {
    app.log.error(
      error as any,
      `Failed fallback tie-breaker for event ${eventId}`,
    );
  }
};

export const resolveTie = async (
  groupId: string,
  eventId: string,
  requesterUsername: string,
  planId: string,
): Promise<
  Result<null, ErrorTypes.UnknownIdError | ErrorTypes.UpdateError>
> => {
  try {
    const [event] = await db
      .select()
      .from(groupEvents)
      .where(and(eq(groupEvents.id, eventId), eq(groupEvents.groupId, groupId)))
      .limit(1);

    if (!event || event.state !== "needs_tiebreaker") {
      return Err(ErrorTypes.UnknownIdError);
    }

    if (event.createdBy !== requesterUsername) {
      return Err(ErrorTypes.UpdateError);
    }

    const plansWithVotes = await db
      .select({
        id: plans.id,
        votesCount: sql<number>`count(${votes.username})::int`,
      })
      .from(plans)
      .leftJoin(votes, eq(plans.id, votes.planId))
      .where(eq(plans.groupEventId, eventId))
      .groupBy(plans.id);

    const targetPlan = plansWithVotes.find((p) => p.id === planId);
    if (!targetPlan) {
      return Err(ErrorTypes.UnknownIdError);
    }

    const maxVotes = Math.max(...plansWithVotes.map((p) => p.votesCount));
    const targetPlanVotes = targetPlan.votesCount;

    if (targetPlanVotes !== maxVotes) {
      return Err(ErrorTypes.UpdateError);
    }

    await db.transaction(async (tx) => {
      await tx.insert(groupEventsFinal).values({
        id: eventId,
        groupId: event.groupId!,
        planId: planId,
      });
      await tx
        .update(groupEvents)
        .set({ state: "finished" })
        .where(eq(groupEvents.id, eventId));
    });

    app.log.info(
      `Event ${eventId} tie-breaker resolved manually by creator ${requesterUsername}. Winner: ${planId}`,
    );
    return Ok(null);
  } catch (error) {
    app.log.error(error as any, `Failed to resolve tie for event ${eventId}`);
    return Err(ErrorTypes.UpdateError);
  }
};
