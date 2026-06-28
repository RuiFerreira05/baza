import LabeledInput from "@/components/LabeledInput";
import { useAuthStyles } from "@/constants/styles/useAuthStyles";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Pressable, Text, View } from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const styles = useAuthStyles();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <KeyboardGestureArea>
          <View style={styles.authCard}>
            <View style={styles.header}>
              <Text style={styles.title}>Baza</Text>
              <Text style={styles.subtitle}>
                Sign in to collaborate on schedules and plans
              </Text>
            </View>

            <View style={styles.form}>
              <LabeledInput
                label="Email or Username"
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="Enter email or username"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <LabeledInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  router.replace("/(protected)");
                }}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
