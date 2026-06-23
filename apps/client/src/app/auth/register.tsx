import { useGlobalStyles } from "@/constants/styles/global";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function RegisterScreen() {
  const styles = useGlobalStyles();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Baza Register</Text>

      <Button
        title="Register (Mock)"
        onPress={() => router.replace("/(protected)")}
      />

      <Button title="Go to Login" onPress={() => router.push("/auth/login")} />
    </View>
  );
}

