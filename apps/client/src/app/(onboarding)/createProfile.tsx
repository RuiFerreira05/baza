import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useAuthState } from "@/hooks/useAuthState";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function CreateProfileScreen() {
  const styles = useGlobalStyles();
  const router = useRouter();
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
    if (!hasNoProfile) {
      return <Redirect href="/(protected)/calendar" />;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Profile (Placeholder)</Text>
      <Text style={[styles.text, { marginVertical: 10 }]}>
        Pick a username to get started.
      </Text>
      <Button
        title="Complete Profile (Mock)"
        onPress={() => router.replace("/(protected)/calendar")}
      />
    </View>
  );
}
