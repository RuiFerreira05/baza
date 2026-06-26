import { Result, StatusError } from "@baza/shared-types";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

export function useAppQuery<TData>(
  options: Omit<UseQueryOptions<TData, StatusError>, "queryFn"> & {
    queryFn: () => Promise<Result<TData, StatusError>>;
  },
): UseQueryResult<TData, StatusError> {
  const { queryFn, ...rest } = options;

  return useQuery<TData, StatusError>({
    ...rest,
    queryFn: async () => {
      const result = await queryFn();
      if (!result.ok) {
        throw result.error;
      }
      return result.value as TData;
    },
  });
}
