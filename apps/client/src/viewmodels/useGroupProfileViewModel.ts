import { useAppQuery } from "@/hooks/useAppQuery";
import { eventService } from "@/services/eventService";
import { groupService } from "@/services/groupService";
import { GroupEventDTO } from "@baza/shared-types";
import { useRouter } from "expo-router";

export function useGroupProfileViewModel(groupId: string) {
  const router = useRouter();

  const navigateToCalendar = () =>
    router.push({
      pathname: "/(protected)/personal/groupSection/group/[id]/calendar",
      params: { id: groupId },
    });
  const navigateToEditProfile = () =>
    router.push({
      pathname: "/(protected)/personal/groupSection/group/[id]/editProfile",
      params: { id: groupId },
    });

  const groupQuery = useAppQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupService.getGroup(groupId),
  });

  const groupMembersQuery = useAppQuery({
    queryKey: ["group-members", groupId],
    queryFn: () => groupService.listMembers(groupId),
  });

  const eventsQuery = useAppQuery({
    queryKey: ["group-events", groupId],
    queryFn: () =>
      eventService.listGroupEvents(groupId, {
        startDate: groupQuery.data?.createdAt.substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10),
      }),
  });

  const getFinishedEvents = () => {
    const finished: GroupEventDTO[] = [];
    eventsQuery.data?.forEach((event) => {
      if (event.state === "finished") {
        finished.push(event);
      }
    });
    return finished;
  };

  const numberOfMembers = groupMembersQuery.data?.length ?? 0;
  const numberOfEvents = getFinishedEvents().length ?? 0;
  const isError =
    groupQuery.isError || (!groupQuery.isLoading && !groupQuery.data);

  return {
    navigateToCalendar,
    navigateToEditProfile,
    groupProfile: groupQuery.data,
    numberOfMembers,
    numberOfEvents,
    refetchGroup: groupQuery.refetch,
    refetchMembers: groupMembersQuery.refetch,
    refetchEvents: eventsQuery.refetch,
    isLoading: groupQuery.isLoading,
    isError,
    error: groupQuery.error?.error || null,
  };
}
