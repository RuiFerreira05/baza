import { useAppQuery } from "@/hooks/useAppQuery";
import { groupService } from "@/services/groupService";
import { useRouter } from "expo-router";

export function useGroupsViewModel(groupId: string) {
  const router = useRouter();

  // Query to fetch group details reactive-style Everytime you call the external API, use this
  // wrapper function "useAppQuery" to ensure that the query is cached and managed properly by React
  // Query. PLus makes it so we don't have to manually manage loading and error states. The queryKey
  // is used to uniquely identify the query in the cache, and the queryFn is the function that
  // fetches the data from the API. The queryKey should be unique for each query, so we use the
  // groupId as part of the key.
  const groupQuery = useAppQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupService.getGroup(groupId),
  });

  return {
    group: groupQuery.data ?? null,
    isLoading: groupQuery.isLoading,
    error: groupQuery.error
      ? `${groupQuery.error.error.type}: ${groupQuery.error.error.message}`
      : null,
    refetchGroup: () => groupQuery.refetch(),
    goBack: () => router.back(),
  };
}
