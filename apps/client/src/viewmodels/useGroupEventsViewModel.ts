import { useAppQuery } from "@/hooks/useAppQuery";
import { useGroupInfo } from "@/hooks/useGroupInfo";
import { eventService } from "@/services/eventService";
import { GroupEventDTO } from "@baza/shared-types";
import { useMemo } from "react";

export interface FormattedGroupEvent {
  event: GroupEventDTO;
  stage: string;
  stageColor: string;
  isPast: boolean;
  creator: string;
  planTitle?: string;
  location?: string;
}

export function useGroupEventsViewModel() {
  const { groupId } = useGroupInfo();
  const isValidGroupId =
    groupId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      groupId,
    );

  // Fetch all group events
  const eventsQuery = useAppQuery({
    queryKey: ["group-events", groupId],
    queryFn: () => eventService.listGroupEvents(groupId!),
    enabled: !!isValidGroupId,
  });

  const rawEvents = useMemo(() => {
    return eventsQuery.data ?? [];
  }, [eventsQuery.data]);

  // Process and format each event
  const formattedEvents = useMemo(() => {
    const now = new Date();

    return rawEvents.map((evt): FormattedGroupEvent => {
      const creator = evt.createdBy;

      // 1. Check if tiebreaker state
      if (evt.state === "needs_tiebreaker") {
        return {
          event: evt,
          stage: "Awaiting Tie Breaker",
          stageColor: "#EF4444", // Red
          isPast: false,
          creator,
        };
      }

      // 2. Check if planning stage (unfinished)
      if (evt.state === "unfinished") {
        const votingEnd = evt.votingEndTime
          ? new Date(evt.votingEndTime)
          : null;
        if (votingEnd && votingEnd > now) {
          const diffMs = votingEnd.getTime() - now.getTime();
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMins = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60),
          );
          const countdown =
            diffHrs > 0 ? `${diffHrs}h ${diffMins}m left` : `${diffMins}m left`;

          return {
            event: evt,
            stage: `Planning (${countdown})`,
            stageColor: "#F59E0B", // Amber
            isPast: false,
            creator,
          };
        } else {
          // Voting deadline has expired but state is still unfinished (needs tiebreaker or finalization check)
          return {
            event: evt,
            stage: "Awaiting Tie Breaker",
            stageColor: "#EF4444",
            isPast: false,
            creator,
          };
        }
      }

      // 3. Check if resolved (finished)
      if (evt.state === "finished" && evt.winningPlan) {
        const plan = evt.winningPlan;
        let eventStart: Date;
        let eventEnd: Date;

        if (plan.allDay) {
          eventStart = new Date(`${plan.date}T00:00:00`);
          eventEnd = new Date(`${plan.date}T23:59:59`);
        } else {
          eventStart = new Date(`${plan.date}T${plan.startTime}`);
          eventEnd = new Date(`${plan.date}T${plan.endTime}`);
        }

        if (eventEnd < now) {
          // Event already happened
          return {
            event: evt,
            stage: "Completed",
            stageColor: "#64748B", // Slate
            isPast: true,
            creator,
            planTitle: plan.title,
            location: plan.location,
          };
        } else {
          // Resolved event in the future. Calculate time left to start
          const diffMs = eventStart.getTime() - now.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          let countdown = "";

          if (diffDays > 0) {
            countdown = `Starts in ${diffDays}d`;
          } else {
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHrs > 0) {
              countdown = `Starts in ${diffHrs}h`;
            } else {
              const diffMins = Math.ceil(diffMs / (1000 * 60));
              countdown = `Starts in ${diffMins}m`;
            }
          }

          return {
            event: evt,
            stage: countdown,
            stageColor: "#10B981", // Green
            isPast: false,
            creator,
            planTitle: plan.title,
            location: plan.location,
          };
        }
      }

      // Fallback fallback
      return {
        event: evt,
        stage: "Planning Over",
        stageColor: "#64748B",
        isPast: false,
        creator,
      };
    });
  }, [rawEvents]);

  // Separate events into active/upcoming and past sections
  const sections = useMemo(() => {
    const activeUpcoming = formattedEvents.filter((e) => !e.isPast);
    const past = formattedEvents.filter((e) => e.isPast);

    return [
      { title: "Active & Upcoming", data: activeUpcoming },
      { title: "Past Events", data: past },
    ];
  }, [formattedEvents]);

  return {
    groupId: groupId!,
    sections,
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error
      ? `${eventsQuery.error.error.type}: ${eventsQuery.error.error.message}`
      : null,
    refetchEvents: () => eventsQuery.refetch(),
  };
}
