import { useAppMutation } from "@/hooks/useAppMutation";
import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuthState } from "@/hooks/useAuthState";
import { queryClient } from "@/lib/queryClient";
import { userService } from "@/services/userService";
import { useMemo } from "react";
import Toast from "react-native-toast-message";

export const useFriendRequestsViewModel = () => {
  const { bypassAuth, profile } = useAuthState();

  const username =
    profile?.username || (bypassAuth ? "alice_smith" : undefined);

  const requestsQuery = useAppQuery({
    queryKey: ["personal-friend-requests", username],
    queryFn: () => userService.getPendingFriendRequests(username!),
    enabled: !!username,
  });

  const requests = useMemo(() => {
    return requestsQuery.data ?? [];
  }, [requestsQuery.data]);

  const respondRequestMutation = useAppMutation({
    mutationFn: ({
      otherUser,
      status,
    }: {
      otherUser: string;
      status: "accepted" | "declined";
    }) => userService.respondFriendRequest(username!, otherUser, { status }),
    onSuccess: (_, { status }) => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Request ${status} successfully!`,
        position: "bottom",
        bottomOffset: 80,
      });
      // Invalidate invites and groups cache
      queryClient.invalidateQueries({
        queryKey: ["personal-friend-requests", username],
      });
      queryClient.invalidateQueries({
        queryKey: ["friends", username],
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to respond to request.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
  });

  const respondToRequest = (
    otherUser: string,
    status: "accepted" | "declined",
  ) => {
    respondRequestMutation.mutate({ otherUser, status });
  };

  return {
    requests,
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    error: requestsQuery.error?.error || null,
    refetch: requestsQuery.refetch,
    respondToRequest,
    isResponding: respondRequestMutation.isPending,
  };
};
