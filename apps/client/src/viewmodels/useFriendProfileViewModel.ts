import { useAppQuery } from "@/hooks/useAppQuery";
import { eventService } from "@/services/eventService";
import { groupService } from "@/services/groupService";
import { userService } from "@/services/userService";
import { ProfileDTO } from "@baza/shared-types/src/protocol/users";

export function useFriendProfileViewModel(user: ProfileDTO, friend: string) {
  const friendProfileQuery = useAppQuery({
    queryKey: ["user-friend-profile", user.username],
    queryFn: () => userService.getFriendProfile(user.username, friend),
  });

  const friendsQuery = useAppQuery({
    queryKey: ["user-friend-friends", user.username],
    queryFn: () => userService.getFriendsNumber(friend),
  });

  const groupsQuery = useAppQuery({
    queryKey: ["user-friend-groups", user.username],
    queryFn: () => groupService.getUserGroupsNumber(friend),
  });

  const eventsQuery = useAppQuery({
    queryKey: ["user-friend-events", user.username],
    queryFn: () =>
      eventService.getPersonalEventsNumber(friend, {
        startDate: user.createdAt.substring(0, 10),
        endDate: new Date().toISOString().substring(0, 10),
      }),
  });

  const numberOfFriends = friendsQuery.data ?? 0;
  const numberOfGroups = groupsQuery.data ?? 0;
  const numberOfEvents = eventsQuery.data ?? 0;
  const isError =
    friendProfileQuery.isError ||
    (!friendProfileQuery.isLoading && !friendProfileQuery.data);

  return {
    friendProfile: friendProfileQuery.data,
    numberOfFriends,
    numberOfGroups,
    numberOfEvents,
    refetchFriends: friendsQuery.refetch,
    refetchGroups: groupsQuery.refetch,
    refetchEvents: eventsQuery.refetch,
    refetchProfile: friendProfileQuery.refetch,
    isLoading: friendProfileQuery.isLoading,
    isError,
  };
}
