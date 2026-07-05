import { useEditProfileStyles } from "@/constants/styles/useEditProfileStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Text } from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const styles = useEditProfileStyles();
  const router = useRouter();
  const { colors } = useAppTheme();

  const { profile, bypassAuth } = useAuthState();

  if (!profile && !bypassAuth) {
    router.push("/(onboarding)/createProfile");
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, width: "100%" }}
      >
        <KeyboardGestureArea
          style={{ flex: 1, width: "100%", alignItems: "center" }}
        >
          <Text>Edit profile</Text>
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
