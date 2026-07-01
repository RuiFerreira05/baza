import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { Text } from "@react-navigation/elements";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupInvites() {
  const styles = useGlobalStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Group Invites</Text>
    </SafeAreaView>
  );
}
