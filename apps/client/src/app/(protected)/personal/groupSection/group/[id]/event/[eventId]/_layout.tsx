import { useAppTheme } from "@/hooks/useAppTheme";
import { Tabs } from "expo-router";
import React from "react";

export default function EventWorkspaceLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      initialRouteName="details"
      screenOptions={({ navigation }) => ({
        headerShown: true,
        animation: "fade",
        tabBarPosition: "top",
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarIconStyle: {
          display: "none",
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },
      })}
    >
      <Tabs.Screen
        name="details"
        options={{
          title: "Details",
        }}
      />
      <Tabs.Screen
        name="proposals"
        options={{
          title: "Proposals",
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          title: "Preferences",
        }}
      />
    </Tabs>
  );
}
