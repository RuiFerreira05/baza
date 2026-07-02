import { useAuthStyles } from "@/constants/styles/useAuthStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  tip?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  isCorrect?: boolean;
  isMultiLine?: boolean;
  isEnabled?: boolean;
}

export default function LabeledInput({
  label,
  value,
  onChangeText,
  tip = "",
  placeholder = "",
  secureTextEntry = false,
  autoCapitalize = "none",
  autoCorrect = false,
  keyboardType = "default",
  isCorrect = false,
  isMultiLine = false,
  isEnabled = true,
}: LabeledInputProps) {
  const styles = useAuthStyles();
  const { colors } = useAppTheme();

  const [isFieldFocused, setisFieldFocused] = useState(false);

  const focusStyle = isCorrect
    ? colors.success
    : isFieldFocused
      ? colors.primary
      : colors.border;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={
          !isMultiLine
            ? [styles.input, { borderColor: focusStyle }]
            : [styles.multiInput, { borderColor: focusStyle }]
        }
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        onFocus={() => setisFieldFocused(true)}
        onBlur={() => setisFieldFocused(false)}
        multiline={isMultiLine}
        numberOfLines={4}
        editable={isEnabled}
      />
      {!!tip && <Text style={styles.tip}>{tip}</Text>}
    </View>
  );
}
