import { useAppMutation } from "@/hooks/useAppMutation";
import { createStatusError, Err, ErrorTypes, Ok } from "@baza/shared-types";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { createWrapper } from "./helpers/wrapper";

describe("useAppMutation", () => {
  it("should resolve data when mutationFn succeeds and returns Ok result", async () => {
    const mockMutationFn = jest.fn().mockResolvedValue(Ok("mutate-success"));
    const wrapper = createWrapper();

    const { result } = await renderHook(
      () =>
        useAppMutation<string, { payload: string }>({
          mutationFn: mockMutationFn,
        }),
      { wrapper },
    );

    await act(async () => {
      result.current.mutate({ payload: "test-input" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("mutate-success");
    expect(mockMutationFn).toHaveBeenCalledWith({ payload: "test-input" });
  });

  it("should throw error and update state to error when mutationFn returns Err result", async () => {
    const statusError = createStatusError(
      ErrorTypes.MalformedRequestError,
      "Bad body",
    );
    const mockMutationFn = jest.fn().mockResolvedValue(Err(statusError));
    const wrapper = createWrapper();

    const { result } = await renderHook(
      () =>
        useAppMutation<string, void>({
          mutationFn: mockMutationFn,
        }),
      { wrapper },
    );

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(statusError);
  });
});
