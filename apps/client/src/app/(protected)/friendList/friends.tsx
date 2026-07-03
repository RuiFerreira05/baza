import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendsScreen() {
  const styles = useFriendsStyles();

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.topBar}></View> */}
      <Text>Friends Screen</Text>
    </SafeAreaView>
  );
}
