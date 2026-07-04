import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGroupInfo } from "@/hooks/useGroupInfo";
import { Stack } from "expo-router";
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
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitle: data?.groupname,
        headerTitleAlign: "center",
      }}
      initialRouteName="calendar"
    >
      <Stack.Screen name="profile" options={{ headerShown: true }} />
      <Stack.Screen
        name="calendar"
        options={{
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen name="events" options={{ headerShown: true }} />
    </Stack>
  );
}
