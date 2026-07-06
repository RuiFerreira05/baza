import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGroupInfo } from "@/hooks/useGroupInfo";
import { Stack, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupLayout() {
  const { data, error, isLoading } = useGroupInfo();
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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ margin: 32, color: colors.onBackground }}>
          error.message
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: data?.groupname,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: colors.surface,
          },
        }}
      />
      <Tabs
        screenOptions={({ navigation }) => ({
          headerShown: false,
          tabBarPosition: "top",
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.placeholder,
          tabBarItemStyle: {
            paddingVertical: 0,
            borderBottomWidth: navigation.isFocused() ? 2 : 0,
            borderBottomColor: colors.primary,
          },
          tabBarIconStyle: {
            display: "none",
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            elevation: 0,
            height: 48,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: "bold",
          },
        })}
        initialRouteName="calendar"
      >
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
        <Tabs.Screen name="events" options={{ title: "Events" }} />
        <Tabs.Screen name="event/[eventId]" options={{ href: null }} />
        <Tabs.Screen name="editProfile" options={{ href: null }} />
        <Tabs.Screen name="members" options={{ href: null }} />
      </Tabs>
    </>
  );
}
