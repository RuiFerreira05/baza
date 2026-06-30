import LabeledInput from "@/components/LabeledInput";
import { useAuthStyles } from "@/constants/styles/useAuthStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { useCreateProfileViewModel } from "@/viewmodels/useCreateProfileViewModel";
import { Redirect } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Text,
  View,
} from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateProfileScreen() {
  const styles = useAuthStyles();
  const { colors } = useAppTheme();
  const vm = useCreateProfileViewModel();
  const { session, hasNoProfile, bypassAuth, isLoading } = useAuthState();

  if (isLoading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <KeyboardGestureArea>
          <View style={styles.authCard}>
            <View style={styles.header}>
              <Text style={styles.title}>Complete Setup</Text>
              <Text style={styles.subtitle}>
                How would you like to be known? This will be your public
                username.
              </Text>
            </View>

            <View style={styles.form}>
              <LabeledInput
                label="Username"
                value={vm.username}
                onChangeText={vm.setUsername}
                placeholder="e.g. john_doe"
                autoCapitalize="none"
                autoCorrect={false}
                isCorrect={vm.isUsernameValid}
                tip={
                  !vm.isUsernameValid && vm.username.length > 0
                    ? "Username must be 3-20 characters long"
                    : ""
                }
              />

              <Pressable
                testID="createProfileButton"
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  (!vm.isUsernameValid || vm.isCreating) &&
                    styles.buttonDisabled,
                ]}
                disabled={!vm.isUsernameValid || vm.isCreating}
                onPress={() => vm.onCreateProfile()}
              >
                {!vm.isCreating ? (
                  <Text style={styles.buttonText}>Create Profile</Text>
                ) : (
                  <ActivityIndicator color={colors.onPrimary} size={"small"} />
                )}
              </Pressable>
              {vm.error && (
                <Text style={{ color: colors.error, marginTop: 8, textAlign: 'center' }}>
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
