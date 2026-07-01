import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { Text } from "@react-navigation/elements";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupList() {
  const styles = useGlobalStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Text>Groups</Text>
    </SafeAreaView>
  );
}
