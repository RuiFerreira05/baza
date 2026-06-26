import { Result, StatusError } from "@baza/shared-types";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

export function useAppMutation<TData, TVariables = void>(
  options: Omit<
    UseMutationOptions<TData, StatusError, TVariables>,
    "mutationFn"
  > & {
    mutationFn: (variables: TVariables) => Promise<Result<TData, StatusError>>;
  },
): UseMutationResult<TData, StatusError, TVariables> {
  const { mutationFn, ...rest } = options;

  return useMutation<TData, StatusError, TVariables>({
    ...rest,
    mutationFn: async (variables: TVariables) => {
      const result = await mutationFn(variables);
      if (!result.ok) {
        throw result.error;
      }
      return result.value as TData;
    },
  });
}
