import { useAuthState } from "@/hooks/useAuthState";
import { MaterialIcons } from "@expo/vector-icons";
import { Href, Redirect, Tabs, useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function AuthLayout() {
  const { session, bypassAuth, isLoading } = useAuthState();
  const { returnUrl } = useLocalSearchParams<{ returnUrl?: string }>();

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  if (!bypassAuth && session) {
    return (
      <Redirect
        href={(returnUrl || "/(protected)/personal/calendar") as Href}
      />
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="login" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "Register",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-add" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
