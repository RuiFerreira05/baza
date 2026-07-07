import { useAppMutation } from "@/hooks/useAppMutation";
import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuthState } from "@/hooks/useAuthState";
import { queryClient } from "@/lib/queryClient";
import { eventService } from "@/services/eventService";
import { planService } from "@/services/planService";
import { groupService } from "@/services/groupService";
import { CreatePlanBody, CreatePreferenceBody } from "@baza/shared-types";
import { useMemo } from "react";
import Toast from "react-native-toast-message";

export type EventStage =
  | "planning"
  | "needs_tiebreaker"
  | "planned"
  | "completed";

export function useEventWorkspaceViewModel(groupId: string, eventId: string) {
  const { profile, bypassAuth } = useAuthState();
  const username = profile?.username || (bypassAuth ? "testuser" : "");

  // ==========================================
  // 1. Queries
  // ==========================================

  // Fetch group event details
  const eventQuery = useAppQuery({
    queryKey: ["group-event", groupId, eventId],
    queryFn: () => eventService.getGroupEvent(groupId, eventId),
    enabled: !!groupId && !!eventId,
  });

  // Fetch proposed plans for the event
  const plansQuery = useAppQuery({
    queryKey: ["event-plans", groupId, eventId],
    queryFn: () => planService.getPlans(groupId, eventId),
    enabled: !!groupId && !!eventId,
  });

  // Fetch current user's preferences
  const userPreferenceQuery = useAppQuery({
    queryKey: ["event-preference-me", groupId, eventId, username],
    queryFn: () => eventService.getUserPreference(groupId, eventId, username),
    enabled: !!groupId && !!eventId && !!username,
    retry: false, // If not found, it is normal (no preferences submitted yet)
  });

  // Fetch all preferences submitted for client-side aggregation
  const allPreferencesQuery = useAppQuery({
    queryKey: ["event-preferences-all", groupId, eventId],
    queryFn: () => eventService.getAllEventPreferences(groupId, eventId),
    enabled: !!groupId && !!eventId,
  });

  // Fetch group preference report aggregated on server
  const groupPreferenceReportQuery = useAppQuery({
    queryKey: ["event-preferences-group", groupId, eventId],
    queryFn: () => eventService.getGroupPreferenceReport(groupId, eventId),
    enabled: !!groupId && !!eventId,
  });

  // Fetch attendance confirmations
  const confirmationsQuery = useAppQuery({
    queryKey: ["event-confirmations", groupId, eventId],
    queryFn: () => eventService.getEventConfirmations(groupId, eventId),
    enabled: !!groupId && !!eventId,
  });

  // Fetch group members to know total count
  const membersQuery = useAppQuery({
    queryKey: ["group-members", groupId],
    queryFn: () => groupService.listMembers(groupId),
    enabled: !!groupId,
  });

  // ==========================================
  // 2. Formatting & Calculations
  // ==========================================

  const eventDetails = eventQuery.data;
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const myPreference = userPreferenceQuery.data;
  const allPreferences = useMemo(
    () => allPreferencesQuery.data ?? [],
    [allPreferencesQuery.data],
  );

  const groupPreferenceReport = useMemo(() => {
    const serverReport = groupPreferenceReportQuery.data;
    if (!serverReport) return null;

    const totalGroupMembers = membersQuery.data?.length ?? 0;
    const submittedCount = serverReport.totalResponses;

    const budgetOverlap = {
      overlapMin: serverReport.budgetRange?.min ?? null,
      overlapMax: serverReport.budgetRange?.max ?? null,
    };

    const dateVotes = serverReport.dateAvailability || {};
    const activityVotes = serverReport.preferredActivities || {};

    const durationVotes = { short: 0, medium: 0, long: 0 };
    const environmentVotes = { inside: 0, outdoors: 0, both: 0 };
    const timeOfDayVotes = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    let totalEstimatedSize = 0;
    let sizeCount = 0;

    allPreferences.forEach((pref) => {
      const p = pref.preference as any;
      if (!p) return;

      if (typeof p.numberOfPeople === "number") {
        totalEstimatedSize += p.numberOfPeople;
        sizeCount++;
      }
      if (Array.isArray(p.duration)) {
        p.duration.forEach((d: string) => {
          if (d in durationVotes) {
            durationVotes[d as keyof typeof durationVotes]++;
          }
        });
      } else if (
        typeof p.duration === "string" &&
        p.duration in durationVotes
      ) {
        durationVotes[p.duration as keyof typeof durationVotes]++;
      }
      if (
        typeof p.insideOutdoors === "string" &&
        p.insideOutdoors in environmentVotes
      ) {
        environmentVotes[p.insideOutdoors as keyof typeof environmentVotes]++;
      }
      if (Array.isArray(p.timeOfDay)) {
        p.timeOfDay.forEach((t: string) => {
          if (t in timeOfDayVotes) {
            timeOfDayVotes[t as keyof typeof timeOfDayVotes]++;
          }
        });
      }
    });

    const estimatedGroupSize = {
      average: sizeCount > 0 ? totalEstimatedSize / sizeCount : null,
    };

    return {
      submittedCount,
      totalGroupMembers,
      budgetOverlap,
      timeOfDayVotes,
      durationVotes,
      environmentVotes,
      dateVotes,
      activityVotes,
      estimatedGroupSize,
    };
  }, [groupPreferenceReportQuery.data, membersQuery.data, allPreferences]);
  const confirmations = useMemo(
    () => confirmationsQuery.data ?? [],
    [confirmationsQuery.data],
  );

  // Determine stage of the event
  const stage = useMemo((): EventStage => {
    if (!eventDetails) return "planning";

    if (eventDetails.state === "needs_tiebreaker") {
      return "needs_tiebreaker";
    }

    if (eventDetails.state === "unfinished") {
      const votingEnd = eventDetails.votingEndTime
        ? new Date(eventDetails.votingEndTime)
        : null;
      const now = new Date();
      if (votingEnd && votingEnd < now) {
        return "needs_tiebreaker"; // fallback if cron hasn't marked it yet
      }
      return "planning";
    }

    if (eventDetails.state === "finished" && eventDetails.winningPlan) {
      const plan = eventDetails.winningPlan;
      const now = new Date();
      let eventEnd: Date;
      if (plan.allDay) {
        eventEnd = new Date(`${plan.date}T23:59:59`);
      } else {
        // Handle postgres time format HH:MM:SS (which might be suffixed with Z by serialization)
        const timePart = plan.endTime.replace("Z", "");
        eventEnd = new Date(`${plan.date}T${timePart}`);
      }

      if (eventEnd < now) {
        return "completed";
      }
      return "planned";
    }

    return "planning";
  }, [eventDetails]);

  // Is the current user confirmed for the finalized event?
  const isConfirmed = useMemo(() => {
    return confirmations.some((c) => c.username === username);
  }, [confirmations, username]);

  // Check if current user is the event creator
  const isCreator = useMemo(() => {
    return eventDetails?.createdBy === username;
  }, [eventDetails, username]);

  // Calculate tied plans if needs tie-breaker
  const maxVotesCount = useMemo(() => {
    if (plans.length === 0) return 0;
    return Math.max(...plans.map((p) => p.votesCount ?? 0));
  }, [plans]);

  const tiedPlanIds = useMemo(() => {
    if (stage !== "needs_tiebreaker" || maxVotesCount === 0)
      return new Set<string>();
    return new Set(
      plans
        .filter((p) => (p.votesCount ?? 0) === maxVotesCount)
        .map((p) => p.id),
    );
  }, [plans, stage, maxVotesCount]);

  // Client-side aggregation of extra preference fields
  const clientPreferenceAggregation = useMemo(() => {
    const totalCount = allPreferences.length;
    if (totalCount === 0) return null;

    const peopleCounts: Record<number, number> = {};
    const durationCounts: Record<string, number> = {};
    const insideOutdoorsCounts: Record<string, number> = {
      inside: 0,
      outdoors: 0,
      both: 0,
    };
    const timeOfDayCounts: Record<string, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };
    const negativeFeedback: string[] = [];

    allPreferences.forEach((pref) => {
      const p = pref.preference as any;
      if (!p) return;

      if (typeof p.numberOfPeople === "number") {
        peopleCounts[p.numberOfPeople] =
          (peopleCounts[p.numberOfPeople] ?? 0) + 1;
      }
      if (Array.isArray(p.duration)) {
        p.duration.forEach((d: string) => {
          durationCounts[d] = (durationCounts[d] ?? 0) + 1;
        });
      } else if (typeof p.duration === "string" && p.duration) {
        durationCounts[p.duration] = (durationCounts[p.duration] ?? 0) + 1;
      }
      if (typeof p.insideOutdoors === "string" && p.insideOutdoors) {
        insideOutdoorsCounts[p.insideOutdoors] =
          (insideOutdoorsCounts[p.insideOutdoors] ?? 0) + 1;
      }
      if (Array.isArray(p.timeOfDay)) {
        p.timeOfDay.forEach((t: string) => {
          if (t in timeOfDayCounts) {
            timeOfDayCounts[t] = (timeOfDayCounts[t] ?? 0) + 1;
          }
        });
      }
      if (
        typeof p.negativePreferences === "string" &&
        p.negativePreferences.trim()
      ) {
        negativeFeedback.push(p.negativePreferences.trim());
      }
    });

    return {
      peopleCounts,
      durationCounts,
      insideOutdoorsCounts,
      timeOfDayCounts,
      negativeFeedback,
    };
  }, [allPreferences]);

  // ==========================================
  // 3. Mutations
  // ==========================================

  // Submit Preference Mutation
  const submitPreferenceMutation = useAppMutation({
    mutationFn: (body: CreatePreferenceBody) =>
      eventService.createOrEditEventPreference(groupId, eventId, body),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Preferences submitted successfully!",
      });
      queryClient.invalidateQueries({
        queryKey: ["event-preference-me", groupId, eventId, username],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-preferences-all", groupId, eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-preferences-group", groupId, eventId],
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to submit preferences.",
      });
    },
  });

  // Propose Plan Mutation
  const createPlanMutation = useAppMutation({
    mutationFn: (body: CreatePlanBody) =>
      planService.createPlan(groupId, eventId, body),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Plan proposal created!",
      });
      queryClient.invalidateQueries({
        queryKey: ["event-plans", groupId, eventId],
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to create plan proposal.",
      });
    },
  });

  // Vote Mutation
  const voteMutation = useAppMutation({
    mutationFn: (planId: string) =>
      planService.submitVote(groupId, eventId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["event-plans", groupId, eventId],
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to submit vote.",
      });
    },
  });

  // Revoke Vote Mutation
  const revokeVoteMutation = useAppMutation({
    mutationFn: (planId: string) =>
      planService.removeVote(groupId, eventId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["event-plans", groupId, eventId],
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to remove vote.",
      });
    },
  });

  // Confirm Attendance Mutation
  const confirmAttendanceMutation = useAppMutation({
    mutationFn: () => eventService.confirmEventAttendance(groupId, eventId),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Attendance confirmed!",
      });
      queryClient.invalidateQueries({
        queryKey: ["event-confirmations", groupId, eventId],
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to confirm attendance.",
      });
    },
  });

  // Revoke Attendance Mutation
  const revokeAttendanceMutation = useAppMutation({
    mutationFn: () => eventService.revokeEventAttendance(groupId, eventId),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Attendance verification cancelled.",
      });
      queryClient.invalidateQueries({
        queryKey: ["event-confirmations", groupId, eventId],
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to cancel attendance confirmation.",
      });
    },
  });

  // Resolve Tie Mutation
  const resolveTieMutation = useAppMutation({
    mutationFn: (planId: string) =>
      eventService.resolveTie(groupId, eventId, { planId }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Tie resolved successfully!",
      });
      queryClient.invalidateQueries({
        queryKey: ["group-event", groupId, eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-plans", groupId, eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to resolve tie.",
      });
    },
  });

  return {
    // Session context
    username,
    isCreator,

    // Query states
    eventDetails,
    plans,
    myPreference,
    allPreferences,
    groupPreferenceReport,
    confirmations,
    stage,
    isConfirmed,
    tiedPlanIds,
    clientPreferenceAggregation,

    // Loading states
    isLoading:
      eventQuery.isLoading ||
      plansQuery.isLoading ||
      confirmationsQuery.isLoading ||
      membersQuery.isLoading,
    isPreferencesLoading:
      userPreferenceQuery.isLoading ||
      allPreferencesQuery.isLoading ||
      groupPreferenceReportQuery.isLoading ||
      membersQuery.isLoading,

    // Error states
    error: eventQuery.error
      ? `${eventQuery.error.error.type}: ${eventQuery.error.error.message}`
      : plansQuery.error
        ? `${plansQuery.error.error.type}: ${plansQuery.error.error.message}`
        : null,

    // Refetch handlers
    refetchAll: () => {
      eventQuery.refetch();
      plansQuery.refetch();
      userPreferenceQuery.refetch();
      allPreferencesQuery.refetch();
      groupPreferenceReportQuery.refetch();
      confirmationsQuery.refetch();
      membersQuery.refetch();
    },

    // Operations
    submitPreference: (body: CreatePreferenceBody) =>
      submitPreferenceMutation.mutateAsync(body),
    isSubmittingPreference: submitPreferenceMutation.isPending,

    createPlan: (body: CreatePlanBody) => createPlanMutation.mutateAsync(body),
    isCreatingPlan: createPlanMutation.isPending,

    votePlan: (planId: string) => voteMutation.mutateAsync(planId),
    revokeVotePlan: (planId: string) => revokeVoteMutation.mutateAsync(planId),

    confirmAttendance: () => confirmAttendanceMutation.mutateAsync(),
    revokeAttendance: () => revokeAttendanceMutation.mutateAsync(),

    resolveTie: (planId: string) => resolveTieMutation.mutateAsync(planId),
    isResolvingTie: resolveTieMutation.isPending,
  };
}
