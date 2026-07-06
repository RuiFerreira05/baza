import { groupService } from "@/services/groupService";
import { useGlobalSearchParams } from "expo-router";
import { useAppQuery } from "./useAppQuery";

export function useGroupInfo() {
  const { id: groupId } = useGlobalSearchParams<{
    id: string;
  }>();

  const query = useAppQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupService.getGroup(groupId),
    enabled: !!groupId,
  });

  return {
    groupId,
    data: query.data,
    isLoading: query.isLoading,
    error: query.error?.error,
    refetch: query.refetch,
  };
}
