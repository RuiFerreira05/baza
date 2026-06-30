import LabeledInput from "@/components/LabeledInput";
import { fireEvent, render, screen, act } from "@testing-library/react-native";
import React from "react";

jest.mock("@/constants/styles/useAuthStyles", () => ({
  useAuthStyles: () => ({
    inputGroup: {},
    label: {},
    input: { borderColor: "default" },
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
      />
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
      />
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
      />
    );

    let input = screen.getByPlaceholderText("Test Placeholder");

    // initially blur (border)
    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: "#border" })])
    );

    // focus
    await act(async () => {
      input.props.onFocus();
    });
    input = screen.getByPlaceholderText("Test Placeholder");
    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: "#primary" })])
    );

    // blur
    await act(async () => {
      input.props.onBlur();
    });
    input = screen.getByPlaceholderText("Test Placeholder");
    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: "#border" })])
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
      />
    );

    const input = screen.getByPlaceholderText("Test Placeholder");

    // should override focus/blur styles
    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: "#success" })])
    );

    fireEvent(input, "focus");
    expect(input.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: "#success" })])
    );
  });
});
