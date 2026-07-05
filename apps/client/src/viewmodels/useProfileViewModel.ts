import { useAppQuery } from "@/hooks/useAppQuery";
import { eventService } from "@/services/eventService";
import { groupService } from "@/services/groupService";
import { userService } from "@/services/userService";
import { ProfileDTO } from "@baza/shared-types/src/protocol/users";
import { useRouter } from "expo-router";

export function useProfileViewModel(profile: ProfileDTO) {
  const router = useRouter();

  const navigateToGroups = () =>
    router.push("/(protected)/personal/groupSection/groupList/groups");
  const navigateToFriends = () =>
    router.push("/(protected)/personal/friendSection/friendList/friends");
  const navigateToCalendar = () =>
    router.push("/(protected)/personal/calendar");
  const navigateToEditProfile = () =>
    router.push("/(protected)/personal/editProfile");
  const navigateToSettings = () => router.push("/(protected)/settings");

  const friendsQuery = useAppQuery({
    queryKey: ["user-friends", profile.username],
    queryFn: () => userService.getFriends(profile.username),
  });

  const groupsQuery = useAppQuery({
    queryKey: ["user-groups", profile.username],
    queryFn: () => groupService.getUserGroups(profile.username),
  });

  const eventsQuery = useAppQuery({
    queryKey: ["user-events", profile.username],
    queryFn: () =>
      eventService.getPersonalEvents(profile.username, {
        startDate: profile.createdAt.substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10),
      }),
  });

  const numberOfFriends = friendsQuery.data?.length ?? 0;
  const numberOfGroups = groupsQuery.data?.length ?? 0;
  const numberOfEvents = eventsQuery.data?.length ?? 0;

  return {
    navigateToGroups,
    navigateToFriends,
    navigateToCalendar,
    navigateToEditProfile,
    navigateToSettings,
    numberOfFriends,
    numberOfGroups,
    numberOfEvents,
    refetchFriends: friendsQuery.refetch,
    refetchGroups: groupsQuery.refetch,
    refetchEvents: eventsQuery.refetch,
  };
}
