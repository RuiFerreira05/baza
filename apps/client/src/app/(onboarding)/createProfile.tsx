import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function CreateProfileScreen() {
  const styles = useGlobalStyles();
  const router = useRouter();

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
