import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuthState } from "@/hooks/useAuthState";
import { userService } from "@/services/userService";
import { useRouter } from "expo-router";
import { useMemo } from "react";

export const useFriendListViewModel = () => {
  const { bypassAuth, profile } = useAuthState();
  const router = useRouter();

  const navigateToFriend = (username: string) =>
    router.push({
      pathname: "/(protected)/[username]",
      params: { username: username },
    });

  const username =
    profile?.username || (bypassAuth ? "alice_smith" : undefined);

  const friendsQuery = useAppQuery({
    queryKey: ["friends", username],
    queryFn: () => userService.getFriends(username!),
    enabled: !!username,
  });

  const friends = useMemo(() => {
    return friendsQuery.data ?? [];
  }, [friendsQuery.data]);

  return {
    friends,
    navigateToFriend,
    isLoading: friendsQuery.isLoading,
    isError: friendsQuery.isError,
    error: friendsQuery.error?.error || null,
    refetch: friendsQuery.refetch,
  };
};
