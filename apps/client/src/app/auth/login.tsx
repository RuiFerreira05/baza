import LabeledInput from "@/components/LabeledInput";
import { useAuthStyles } from "@/constants/styles/useAuthStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLoginViewModel } from "@/viewmodels/useLoginViewModel";
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

export default function LoginScreen() {
  const styles = useAuthStyles();
  const { colors } = useAppTheme();
  const vm = useLoginViewModel();

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
                label="Email"
                value={vm.identifier}
                onChangeText={vm.setIdentifier}
                placeholder="e.g. john@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                isCorrect={vm.isIdentifierValid}
              />

              <LabeledInput
                label="Password"
                value={vm.password}
                onChangeText={vm.setPassword}
                placeholder="Enter password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                isCorrect={vm.isPasswordValid}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  (!vm.isFormValid || vm.loading) && styles.buttonDisabled,
                ]}
                disabled={!vm.isFormValid || vm.loading}
                onPress={() => {
                  vm.onSignIn();
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
                  vm.loading && styles.buttonDisabled,
                ]}
                disabled={vm.loading}
                onPress={() => {
                  vm.onGoogleSignIn();
                }}
              >
                {vm.loading ? (
                  <ActivityIndicator color={colors.onSurface} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="logo-google"
                      size={20}
                      color={colors.onSurface}
                    />
                    <Text style={styles.googleButtonText}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </Pressable>

              {vm.error && (
                <Text style={{ color: colors.error, marginTop: 8 }}>
                  {vm.error}
                </Text>
              )}
            </View>
          </View>
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
