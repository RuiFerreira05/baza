import { authClient } from "@/lib/auth";
import { styles } from "@/styles/styles";
import { Redirect, Stack } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { View, Text } from "react-native";

export default function RootLayout() {

  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Loading...</Text>
        </View>
      );
    }

  if (session) {
    return <Redirect href="/(protected)" />;
  }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="login">
        <NativeTabs.Trigger.Label>Login</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="login" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="signUp">
        <NativeTabs.Trigger.Label>Sign Up</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="person_add" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
