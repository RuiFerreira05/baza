import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendsScreen() {
  const styles = useFriendsStyles();
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.topBar}></View> */}
      <Text>Friends Screen</Text>
    </SafeAreaView>
  );
}
