import { useAppQuery } from "@/hooks/useAppQuery";
import { createStatusError, Err, ErrorTypes, Ok } from "@baza/shared-types";
import { renderHook, waitFor } from "@testing-library/react-native";
import { createWrapper } from "./helpers/wrapper";

describe("useAppQuery", () => {
  it("should resolve data when queryFn returns Ok result", async () => {
    const mockQueryFn = jest.fn().mockResolvedValue(Ok("query-success-data"));
    const wrapper = createWrapper();

    const { result } = await renderHook(
      () =>
        useAppQuery({
          queryKey: ["testQuerySuccess"],
          queryFn: mockQueryFn,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("query-success-data");
  });

  it("should throw error and update query state to error when queryFn returns Err result", async () => {
    const statusError = createStatusError(
      ErrorTypes.UnauthorizedError,
      "Unauthorized access",
    );
    const mockQueryFn = jest.fn().mockResolvedValue(Err(statusError));
    const wrapper = createWrapper();

    const { result } = await renderHook(
      () =>
        useAppQuery({
          queryKey: ["testQueryFailure"],
          queryFn: mockQueryFn,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(statusError);
  });
});
