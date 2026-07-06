import { useAppQuery } from "@/hooks/useAppQuery";
import { eventService } from "@/services/eventService";
import { groupService } from "@/services/groupService";
import { GroupDTO, GroupEventDTO } from "@baza/shared-types";
import { useRouter } from "expo-router";

export function useGroupProfileViewModel(group: GroupDTO) {
  const router = useRouter();

  const navigateToCalendar = () =>
    router.push({
      pathname: "/(protected)/personal/groupSection/group/[id]/calendar",
      params: { id: group.id },
    });
  const navigateToEditProfile = () =>
    router.push({
      pathname: "/(protected)/personal/groupSection/group/[id]/editProfile",
      params: { id: group.id },
    });

  const groupMembersQuery = useAppQuery({
    queryKey: ["group-members", group.id],
    queryFn: () => groupService.listMembers(group.id),
  });

  const eventsQuery = useAppQuery({
    queryKey: ["group-events", group.id],
    queryFn: () =>
      eventService.listGroupEvents(group.id, {
        startDate: group.createdAt.substring(0, 10),
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

  return {
    navigateToCalendar,
    navigateToEditProfile,
    numberOfMembers,
    numberOfEvents,
    members: groupMembersQuery.data,
    refetchMembers: groupMembersQuery.refetch,
    refetchEvents: eventsQuery.refetch,
  };
}
