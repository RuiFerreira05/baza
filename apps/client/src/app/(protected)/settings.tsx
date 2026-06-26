import React, { useMemo } from "react";
import {
  SectionList,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Imports from the existing codebase
import { useSettingsStyles } from "@/constants/styles/useSettingsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import {} from "@/store/useSettingsStore";
import {
  ButtonSetting,
  InputSetting,
  SelectSetting,
  Settings,
  SettingsType,
  ToggleSetting,
} from "@/types/settingsTypes";
import { useSettingsViewModel } from "@/viewmodels/useSettingsViewModel";
import {
  KeyboardAvoidingView,
  KeyboardGestureArea,
} from "react-native-keyboard-controller";

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const rawSections = useSettingsViewModel();

  // 1. Filter out hidden settings and format for SectionList
  const visibleSections = useMemo(() => {
    return rawSections
      .map((section) => ({
        title: section.title,
        data: section.settings.filter(
          (setting) => !setting.visibilityFn || setting.visibilityFn(),
        ),
      }))
      .filter((section) => section.data.length > 0);
  }, [rawSections]);

  // 2. Create local style sheet bound to current theme colors
  const styles = useSettingsStyles();

  // 3. Define the item renderer switch
  const renderSettingItem = ({ item }: { item: Settings }) => {
    switch (item.type) {
      case SettingsType.TOGGLE:
        return <ToggleItem setting={item} styles={styles} colors={colors} />;
      case SettingsType.SELECT:
        return <SelectItem setting={item} styles={styles} />;
      case SettingsType.INPUT:
        return <InputItem setting={item} styles={styles} colors={colors} />;
      case SettingsType.BUTTON:
        return <ButtonItem setting={item} styles={styles} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <KeyboardGestureArea>
          <SectionList
            sections={visibleSections}
            keyExtractor={(item) => item.id}
            renderItem={renderSettingItem}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// Sub-Component Renderers
// ==========================================

const SettingHeader = ({
  label,
  description,
  styles,
}: {
  label: string;
  description?: string;
  styles: any;
}) => (
  <View style={styles.textContainer}>
    <Text style={styles.label}>{label}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
  </View>
);

const ToggleItem = ({
  setting,
  styles,
  colors,
}: {
  setting: ToggleSetting;
  styles: any;
  colors: any;
}) => {
  const handleToggle = async (newValue: boolean) => {
    const result = await setting.onChangeFn(newValue);
    if (!result.ok) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: result.error.message,
      });
    }
  };

  return (
    <View style={styles.row}>
      <SettingHeader
        label={setting.label}
        description={setting.description}
        styles={styles}
      />
      <Switch
        value={setting.value}
        onValueChange={handleToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={setting.value ? colors.onPrimary : colors.placeholder}
      />
    </View>
  );
};

const SelectItem = ({
  setting,
  styles,
}: {
  setting: SelectSetting;
  styles: any;
}) => {
  const handleSelect = async (newValue: string) => {
    const result = await setting.onChangeFn(newValue);
    if (!result.ok) {
      Toast.show({
        type: "error",
        text1: "Selection Failed",
        text2: result.error.message,
      });
    }
  };

  return (
    <View style={styles.columnRow}>
      <SettingHeader
        label={setting.label}
        description={setting.description}
        styles={styles}
      />
      <View style={styles.capsuleContainer}>
        {setting.options.map((option) => {
          const isSelected = setting.value === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.capsule, isSelected && styles.capsuleActive]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.capsuleText,
                  isSelected && styles.capsuleTextActive,
                ]}
              >
                {option.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const InputItem = ({
  setting,
  styles,
  colors,
}: {
  setting: InputSetting;
  styles: any;
  colors: any;
}) => {
  const handleBlur = async (text: string) => {
    if (text === setting.value) return;
    const result = await setting.onChangeFn(text);
    if (!result.ok) {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: result.error.message,
      });
    }
  };

  return (
    <View style={styles.columnRow}>
      <SettingHeader
        label={setting.label}
        description={setting.description}
        styles={styles}
      />
      <TextInput
        style={styles.textInput}
        defaultValue={setting.value}
        placeholder={setting.placeholder}
        placeholderTextColor={colors.placeholder}
        onEndEditing={(e) => handleBlur(e.nativeEvent.text)}
      />
    </View>
  );
};

const ButtonItem = ({
  setting,
  styles,
}: {
  setting: ButtonSetting;
  styles: any;
}) => {
  const handlePress = async () => {
    const result = await setting.onClickFn();
    if (!result.ok) {
      Toast.show({
        type: "error",
        text1: "Action Failed",
        text2: result.error.message,
      });
    }
  };

  return (
    <View style={styles.row}>
      <SettingHeader
        label={setting.label}
        description={setting.description}
        styles={styles}
      />
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Action</Text>
      </TouchableOpacity>
    </View>
  );
};
