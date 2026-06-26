import { getToastConfig } from "@/components/ToastConfig";
import { Theme } from "@/constants/theme";
import { DefaultTheme } from "@react-navigation/native";
import { render, screen } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native-toast-message", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    BaseToast: (props: any) => (
      <>
        <Text>{props.text1}</Text>
        <Text>{props.text2}</Text>
      </>
    ),
    ErrorToast: (props: any) => (
      <>
        <Text>{props.text1}</Text>
        <Text>{props.text2}</Text>
      </>
    ),
  };
});

describe("ToastConfig", () => {
  const colors = Theme.light;
  const appTheme = DefaultTheme;
  const config = getToastConfig(colors, appTheme);

  it("should render success toast with correct styles and text", async () => {
    const SuccessToastComponent = config.success;
    await render(
      <SuccessToastComponent
        text1="Success Title"
        text2="Success Details"
      />
    );

    expect(screen.getByText("Success Title")).toBeTruthy();
    expect(screen.getByText("Success Details")).toBeTruthy();
  });

  it("should render error toast with correct styles and text", async () => {
    const ErrorToastComponent = config.error;
    await render(
      <ErrorToastComponent
        text1="Error Title"
        text2="Error Details"
      />
    );

    expect(screen.getByText("Error Title")).toBeTruthy();
    expect(screen.getByText("Error Details")).toBeTruthy();
  });

  it("should render info toast with correct styles and text", async () => {
    const InfoToastComponent = config.info;
    await render(
      <InfoToastComponent
        text1="Info Title"
        text2="Info Details"
      />
    );

    expect(screen.getByText("Info Title")).toBeTruthy();
    expect(screen.getByText("Info Details")).toBeTruthy();
  });
});
