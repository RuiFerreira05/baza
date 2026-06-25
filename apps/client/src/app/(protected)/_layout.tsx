import { Ionicons } from "@expo/vector-icons"; // Standard vector icons bundled with Expo
import { Tabs } from "expo-router";

export default function ProtectedLayout() {
  // Authentication guarding is handled centrally in the root _layout.tsx.

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // tabBarActiveTintColor: "#2f95dc", // Customize the active tab color
        // tabBarInactiveTintColor: "#8e8e93", // Customize the inactive tab color
        // tabBarStyle: {
        //   borderTopWidth: 1,
        //   borderTopColor: "#e5e5ea",
        //   height: 50 + insets.bottom,
        //   paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
        //   paddingTop: 6,
        // },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
