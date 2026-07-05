import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, Stack } from "expo-router";
import { ActivityIndicator, Platform, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const { session, hasNoProfile, bypassAuth, isLoading } = useAuthState();
  const { colors } = useAppTheme();
  const styles = useGlobalStyles();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size={72} color={colors.primary} />
        <Text style={{ margin: 32, color: colors.onBackground }}>
          Please wait while we establish a connection with the server...
        </Text>
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          animation: "slide_from_left",
          title: "Settings",
          headerBackButtonMenuEnabled: false,
          headerBackVisible: false,
          headerRight: () => (
            <Ionicons
              name={Platform.OS === "ios" ? "chevron-forward" : "arrow-forward"}
              size={24}
              color={colors.onBackground}
              onPress={() => router.back()}
            />
          ),
        }}
      />
    </Stack>
  );
}
