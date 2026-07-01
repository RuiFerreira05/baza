import { useAuthState } from "@/hooks/useAuthState";
import { Ionicons } from "@expo/vector-icons"; // Standard vector icons bundled with Expo
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function ProtectedLayout() {
  const { session, hasNoProfile, bypassAuth, isLoading } = useAuthState();

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  if (!bypassAuth) {
    if (!session) {
      return <Redirect href="/auth/login" />;
    }
    if (hasNoProfile) {
      return <Redirect href="/(onboarding)/createProfile" />;
    }
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "fade",
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

      <Tabs.Screen name="friends" options={{ href: null }} />

      <Tabs.Screen name="editProfile" options={{ href: null }} />
    </Tabs>
  );
}
