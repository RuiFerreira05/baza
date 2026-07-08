import LabeledInput from "@/components/LabeledInput";
import { fireEvent, render, screen, act } from "@testing-library/react-native";
import React from "react";

jest.mock("@/constants/styles/useAuthStyles", () => ({
  useAuthStyles: () => ({
    inputGroup: {},
    label: {},
    inputContainer: { borderColor: "default" },
    textInput: {},
    revealButton: {},
    tip: {},
  }),
}));

jest.mock("@/hooks/useAppTheme", () => ({
  useAppTheme: () => ({
    colors: {
      primary: "#primary",
      border: "#border",
      success: "#success",
      placeholder: "#placeholder",
    },
  }),
}));

describe("LabeledInput", () => {
  it("should render correctly with label and placeholder", async () => {
    await render(
      <LabeledInput
        label="Test Label"
        value=""
        onChangeText={jest.fn()}
        placeholder="Test Placeholder"
      />,
    );

    expect(screen.getByText("Test Label")).toBeTruthy();
    expect(screen.getByPlaceholderText("Test Placeholder")).toBeTruthy();
  });

  it("should display a tip when provided", async () => {
    await render(
      <LabeledInput
        label="Test Label"
        value=""
        onChangeText={jest.fn()}
        tip="Test Tip"
      />,
    );

    expect(screen.getByText("Test Tip")).toBeTruthy();
  });

  it("should update focus style on focus and blur", async () => {
    await render(
      <LabeledInput
        label="Test Label"
        value=""
        onChangeText={jest.fn()}
        placeholder="Test Placeholder"
        testID="labeled-input-container"
      />,
    );

    const container = screen.getByTestId("labeled-input-container");
    const input = screen.getByPlaceholderText("Test Placeholder");

    // initially blur (border)
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: "#border" }),
      ]),
    );

    // focus
    await act(async () => {
      input.props.onFocus();
    });
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: "#primary" }),
      ]),
    );

    // blur
    await act(async () => {
      input.props.onBlur();
    });
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: "#border" }),
      ]),
    );
  });

  it("should use success color when isCorrect is true", async () => {
    await render(
      <LabeledInput
        label="Test Label"
        value=""
        onChangeText={jest.fn()}
        placeholder="Test Placeholder"
        isCorrect={true}
        testID="labeled-input-container"
      />,
    );

    const container = screen.getByTestId("labeled-input-container");
    const input = screen.getByPlaceholderText("Test Placeholder");

    // should override focus/blur styles
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: "#success" }),
      ]),
    );

    fireEvent(input, "focus");
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderColor: "#success" }),
      ]),
    );
  });

  it("should toggle secureTextEntry when eye toggle button is pressed", async () => {
    const mockOnChange = jest.fn();
    await render(
      <LabeledInput
        label="Password"
        value="myPassword"
        onChangeText={mockOnChange}
        placeholder="Enter password"
        secureTextEntry={true}
      />,
    );

    let input = screen.getByPlaceholderText("Enter password");
    // Secure input should initially hide the text
    expect(input.props.secureTextEntry).toBe(true);

    // Toggle button should be present
    const toggleButton = screen.getByTestId("password-visibility-toggle");
    expect(toggleButton).toBeTruthy();

    // Tap toggle button
    await act(async () => {
      fireEvent.press(toggleButton);
    });

    // secureTextEntry should now be false (visible)
    input = screen.getByPlaceholderText("Enter password");
    expect(input.props.secureTextEntry).toBe(false);

    // Tap toggle button again
    await act(async () => {
      fireEvent.press(toggleButton);
    });

    // secureTextEntry should be true again (hidden)
    input = screen.getByPlaceholderText("Enter password");
    expect(input.props.secureTextEntry).toBe(true);
  });
});
