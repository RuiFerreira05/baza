import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const styles = useGlobalStyles();
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Edit Profile Screen</Text>
    </SafeAreaView>
  );
}
