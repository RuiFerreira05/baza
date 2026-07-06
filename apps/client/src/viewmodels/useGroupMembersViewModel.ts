import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuthState } from "@/hooks/useAuthState";
import { groupService } from "@/services/groupService";
import { userService } from "@/services/userService";
import { GroupDTO } from "@baza/shared-types";
import { useRouter } from "expo-router";
import { useMemo } from "react";

export const useGroupMembersViewModel = (group: GroupDTO) => {
  const { bypassAuth, profile } = useAuthState();
  const router = useRouter();

  const navigateToFriend = (username: string) =>
    router.push({
      pathname: "/(protected)/personal/friendSection/[username]",
      params: { username: username },
    });

  const groupMembersQuery = useAppQuery({
    queryKey: ["group-members", group.id],
    queryFn: () => groupService.listMembers(group.id),
  });

  const members = useMemo(() => {
    return groupMembersQuery.data ?? [];
  }, [groupMembersQuery.data]);

  const friendsQuery = useAppQuery({
    queryKey: ["user-friends", profile?.username],
    queryFn: () => userService.getFriends(profile!.username),
    enabled: !!profile,
  });

  const userfriends = useMemo(() => {
    return friendsQuery.data ?? [];
  }, [friendsQuery.data]);

  return {
    members,
    userfriends,
    navigateToFriend,
    isLoading: groupMembersQuery.isLoading,
    isError: groupMembersQuery.isError,
    error: groupMembersQuery.error?.error || null,
    refetch: groupMembersQuery.refetch,
  };
};
