import { useAuthStyles } from "@/constants/styles/useAuthStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useRegisterViewModel } from "@/viewmodels/useRegisterViewModel";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Text,
  View,
} from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import LabeledInput from "../../components/LabeledInput";

export default function RegisterScreen() {
  const styles = useAuthStyles();
  const { colors } = useAppTheme();
  const vm = useRegisterViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <KeyboardGestureArea>
          <View style={styles.authCard}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join Baza to schedule and vote with friends
              </Text>
            </View>

            <View style={styles.form}>
              <LabeledInput
                label="Name"
                value={vm.name}
                onChangeText={vm.setName}
                placeholder="Your name"
                autoCapitalize="words"
                autoCorrect={false}
                isCorrect={vm.isNameValid}
              />

              <LabeledInput
                label="Email"
                value={vm.email}
                onChangeText={vm.setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                isCorrect={vm.isEmailValid}
              />

              <LabeledInput
                label="Password"
                value={vm.password}
                onChangeText={vm.setPassword}
                placeholder="Create a strong password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                isCorrect={vm.isPasswordValid}
                tip={
                  !vm.isPasswordValid && vm.password.length > 0
                    ? "Password must be at least 8 characters long"
                    : ""
                }
              />

              <LabeledInput
                label="Confirm Password"
                value={vm.confirmPassword}
                onChangeText={vm.setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                isCorrect={vm.isConfirmPasswordValid}
                tip={
                  !vm.isConfirmPasswordValid && vm.confirmPassword.length > 0
                    ? "Passwords must match"
                    : ""
                }
              />

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  !vm.isFormValid && styles.buttonDisabled,
                ]}
                disabled={!vm.isFormValid}
                onPress={() => {
                  vm.onSignUp();
                }}
              >
                {!vm.loading ? (
                  <Text style={styles.buttonText}>Sign In</Text>
                ) : (
                  <ActivityIndicator color={colors.onPrimary} size={"small"} />
                )}
              </Pressable>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.googleButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  vm.onGoogleSignIn();
                }}
              >
                <Ionicons
                  name="logo-google"
                  size={20}
                  color={colors.onSurface}
                />
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </Pressable>

              {vm.error ? (
                <Text style={{ color: colors.error, marginTop: 8 }}>
                  {vm.error}
                </Text>
              ) : null}
            </View>
          </View>
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
