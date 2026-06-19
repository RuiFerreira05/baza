import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

describe("AppErrorBoundary", () => {
  it("should render error name and message correctly", async () => {
    const error = new Error("Something broke!");
    const mockRetry = jest.fn();

    await render(<AppErrorBoundary error={error} retry={mockRetry} />);

    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(
      screen.getByText(
        "We encountered an unexpected error. The development team has been notified.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Error: Something broke!")).toBeTruthy();
  });

  it("should render fallback text when error name or message is missing", async () => {
    const error = {} as Error;
    const mockRetry = jest.fn();

    await render(<AppErrorBoundary error={error} retry={mockRetry} />);

    expect(screen.getByText("Error: Unknown error occurred")).toBeTruthy();
  });

  it("should execute retry callback when Try Again button is pressed", async () => {
    const error = new Error("Fail");
    const mockRetry = jest.fn().mockResolvedValue(undefined);

    await render(<AppErrorBoundary error={error} retry={mockRetry} />);

    const retryButton = screen.getByText("Try Again");
    fireEvent.press(retryButton);

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
});
