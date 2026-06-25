import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeMode, useSettingsStore } from "@/store/useSettingsStore";
import { useRouter } from "expo-router";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const styles = useGlobalStyles();
  const router = useRouter();
  const settingsStore = useSettingsStore();
  const { themeMode } = useAppTheme();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Profile Screen</Text>

      <Text style={{ marginTop: 10 }}>Current Theme Mode: {themeMode}</Text>
      <Button
        title="Change to dark"
        onPress={() => settingsStore.setThemeMode(ThemeMode.DARK)}
      ></Button>
      <Button
        title="Change to light"
        onPress={() => settingsStore.setThemeMode(ThemeMode.LIGHT)}
      ></Button>
      <Button
        title="Change to system"
        onPress={() => settingsStore.setThemeMode(ThemeMode.SYSTEM)}
      ></Button>
      <Button title="Back to Calendar" onPress={() => router.back()} />
    </SafeAreaView>
  );
}
