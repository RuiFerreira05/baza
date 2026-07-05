import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { Ionicons } from "@expo/vector-icons"; // Standard vector icons bundled with Expo
import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const { session, hasNoProfile, bypassAuth, isLoading } = useAuthState();
  const { colors } = useAppTheme();
  const styles = useGlobalStyles();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ margin: 32, color: colors.onBackground }}>
          Please wait while we establish a connection with the server...
        </Text>
        <ActivityIndicator size={72} color={colors.primary} />
      </SafeAreaView>
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
        name="groupList"
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
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="editProfile" options={{ href: null }} />
      <Tabs.Screen name="friendList" options={{ href: null }} />
      <Tabs.Screen name="[username]" options={{ href: null }} />
    </Tabs>
  );
}
