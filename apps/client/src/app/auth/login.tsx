import { useGlobalStyles } from "@/constants/styles/global";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function LoginScreen() {
  const styles = useGlobalStyles();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Baza Login</Text>

      <Button
        title="Login (Mock)"
        onPress={() => router.replace("/(protected)")}
      />

      <Button
        title="Go to Register"
        onPress={() => router.push("/auth/register")}
      />
    </View>
  );
}

