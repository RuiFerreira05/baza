import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function LoginScreen() {
  const styles = useGlobalStyles();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Baza Login</Text>

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
