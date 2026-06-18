import { GlobalStyles } from "@/constants/styles/global";
import { useSettingsStore, useTheme } from "@/store/useSettingsStore";
import { useRouter } from "expo-router";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const settingsStore = useSettingsStore();
  const { themeMode } = useTheme();

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Profile Screen</Text>

      <Text style={{ marginTop: 10 }}>Current Theme Mode: {themeMode}</Text>
      <Button
        title="Change to dark"
        onPress={() => settingsStore.setThemeMode("dark")}
      ></Button>
      <Button
        title="Change to light"
        onPress={() => settingsStore.setThemeMode("light")}
      ></Button>
      <Button
        title="Change to system"
        onPress={() => settingsStore.setThemeMode("system")}
      ></Button>
      <Button title="Back to Calendar" onPress={() => router.back()} />
    </SafeAreaView>
  );
}
