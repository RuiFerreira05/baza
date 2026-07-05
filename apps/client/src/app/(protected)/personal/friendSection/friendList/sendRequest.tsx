import LabeledInput from "@/components/LabeledInput";
import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAddFriendViewModel } from "@/viewmodels/useAddFriendViewModel";
import FontAwesome from "@expo/vector-icons/FontAwesome6";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Text,
  View,
} from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SendRequestScreen() {
  const styles = useFriendsStyles();
  const { colors } = useAppTheme();
  const vm = useAddFriendViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, width: "100%" }}
      >
        <KeyboardGestureArea style={{ flex: 1, width: "100%" }}>
          <View
            style={{
              flex: 1,
              width: "100%",
              paddingVertical: 10,
            }}
          >
            <View style={styles.titleContainer}>
              <FontAwesome
                name="face-grin-wink"
                size={48}
                color={colors.placeholder}
              />
              <Text style={styles.titleFriends}>Add new friends!</Text>
            </View>

            <View style={styles.inputCard}>
              <View style={styles.form}>
                <LabeledInput
                  label="Insert username of user"
                  value={vm.usernameInput}
                  onChangeText={vm.setUsernameInput}
                  placeholder="e.g. john_doe"
                  autoCapitalize="none"
                  autoCorrect={false}
                  isCorrect={vm.isUsernameValid}
                  isEnabled={true}
                />

                <Pressable
                  testID="addFriendButton"
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    (!vm.isUsernameValid || vm.isSending) &&
                      styles.buttonDisabled,
                  ]}
                  disabled={!vm.isUsernameValid || vm.isSending}
                  onPress={() => vm.sendRequest()}
                >
                  {!vm.isSending ? (
                    <Text style={styles.buttonText}>Send request</Text>
                  ) : (
                    <ActivityIndicator
                      color={colors.onPrimary}
                      size={"small"}
                    />
                  )}
                </Pressable>
                {vm.error && (
                  <Text
                    style={{
                      color: colors.error,
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    {vm.error}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
