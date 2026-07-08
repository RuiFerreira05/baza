import { useAuthStyles } from "@/constants/styles/useAuthStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LabeledInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  tip?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  isCorrect?: boolean;
  isMultiLine?: boolean;
  isEnabled?: boolean;
  testID?: string;
}

export default function LabeledInput({
  value,
  onChangeText,
  label = undefined,
  tip = undefined,
  placeholder = undefined,
  secureTextEntry = false,
  autoCapitalize = "none",
  autoCorrect = false,
  keyboardType = "default",
  isCorrect = false,
  isMultiLine = false,
  isEnabled = true,
  testID = undefined,
}: LabeledInputProps) {
  const styles = useAuthStyles();
  const { colors } = useAppTheme();

  const [isFieldFocused, setisFieldFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const focusStyle = isCorrect
    ? colors.success
    : isFieldFocused
      ? colors.primary
      : colors.border;

  return (
    <View style={styles.inputGroup}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        testID={testID}
        style={[
          styles.inputContainer,
          { borderColor: focusStyle },
          isMultiLine && styles.multiInputContainer,
          !secureTextEntry && { paddingRight: 16 },
        ]}
      >
        <TextInput
          style={[styles.textInput, isMultiLine && styles.multiTextInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          onFocus={() => setisFieldFocused(true)}
          onBlur={() => setisFieldFocused(false)}
          multiline={isMultiLine}
          numberOfLines={4}
          editable={isEnabled}
        />
        {secureTextEntry && (
          <Pressable
            testID="password-visibility-toggle"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.revealButton}
            hitSlop={8}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        )}
      </View>
      {!!tip && <Text style={styles.tip}>{tip}</Text>}
    </View>
  );
}
