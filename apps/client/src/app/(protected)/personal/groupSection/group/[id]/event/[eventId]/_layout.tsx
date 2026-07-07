import { Stack } from "expo-router";
import React from "react";

export default function EventWorkspaceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="details" />
    </Stack>
  );
}
