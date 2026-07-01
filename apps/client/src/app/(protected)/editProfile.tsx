import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const styles = useGlobalStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Edit Profile Screen</Text>
    </SafeAreaView>
  );
}
