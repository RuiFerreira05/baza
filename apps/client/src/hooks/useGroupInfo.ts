import { groupService } from "@/services/groupService";
import { useLocalSearchParams } from "expo-router";
import { useAppQuery } from "./useAppQuery";

export function useGroupInfo() {
  const { id: groupId } = useLocalSearchParams<{
    id: string;
  }>();

  const query = useAppQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupService.getGroup(groupId),
    enabled: !!groupId,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error?.error,
    refetch: query.refetch,
  };
}
