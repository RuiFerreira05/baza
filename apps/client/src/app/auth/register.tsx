import { useAuthStyles } from "@/constants/styles/useAuthStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const styles = useAuthStyles();
  const { colors } = useAppTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: "center" }}
      >
        <KeyboardGestureArea>
          <View style={styles.authCard}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join Baza to schedule and vote with friends
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={[styles.input, isNameFocused && styles.inputFocused]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  placeholderTextColor={colors.placeholder}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, isEmailFocused && styles.inputFocused]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    isPasswordFocused && styles.inputFocused,
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  router.replace("/(protected)");
                }}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
