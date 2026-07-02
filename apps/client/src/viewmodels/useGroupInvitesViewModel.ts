import { useAppMutation } from "@/hooks/useAppMutation";
import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuthState } from "@/hooks/useAuthState";
import { queryClient } from "@/lib/queryClient";
import { groupService } from "@/services/groupService";
import { useMemo } from "react";
import Toast from "react-native-toast-message";

export const useGroupInvitesViewModel = () => {
  const { bypassAuth, profile } = useAuthState();

  const username =
    profile?.username || (bypassAuth ? "alice_smith" : undefined);

  const invitesQuery = useAppQuery({
    queryKey: ["personal-group-invites", username],
    queryFn: () => groupService.getUserGroupInvites(username!),
    enabled: !!username,
  });

  const invites = useMemo(() => {
    return invitesQuery.data ?? [];
  }, [invitesQuery.data]);

  const respondInviteMutation = useAppMutation({
    mutationFn: ({
      groupId,
      status,
    }: {
      groupId: string;
      status: "accepted" | "declined";
    }) => groupService.respondGroupInvite(username!, groupId, { status }),
    onSuccess: (_, { status }) => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Invite ${status} successfully!`,
        position: "bottom",
        bottomOffset: 80,
      });
      // Invalidate invites and groups cache
      queryClient.invalidateQueries({
        queryKey: ["personal-group-invites", username],
      });
      queryClient.invalidateQueries({
        queryKey: ["personal-groups", username],
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to respond to invite.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
  });

  const respondToInvite = (
    groupId: string,
    status: "accepted" | "declined",
  ) => {
    respondInviteMutation.mutate({ groupId, status });
  };

  return {
    invites,
    isLoading: invitesQuery.isLoading,
    isError: invitesQuery.isError,
    error: invitesQuery.error?.error || null,
    refetch: invitesQuery.refetch,
    respondToInvite,
    isResponding: respondInviteMutation.isPending,
  };
};
