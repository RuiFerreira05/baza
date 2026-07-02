import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuthState } from "@/hooks/useAuthState";
import { groupService } from "@/services/groupService";
import { useMemo } from "react";

export const useGroupListViewModel = () => {
  const { bypassAuth, profile } = useAuthState();

  const username =
    profile?.username || (bypassAuth ? "alice_smith" : undefined);

  const groupsQuery = useAppQuery({
    queryKey: ["personal-groups", username],
    queryFn: () => groupService.getUserGroups(username!),
    enabled: !!username,
  });

  const groups = useMemo(() => {
    return groupsQuery.data ?? [];
  }, [groupsQuery.data]);

  return {
    groups,
    isLoading: groupsQuery.isLoading,
    isError: groupsQuery.isError,
    error: groupsQuery.error?.error || null,
    refetch: groupsQuery.refetch,
  };
};
