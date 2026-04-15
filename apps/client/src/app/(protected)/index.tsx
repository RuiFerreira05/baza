import { styles } from "@/styles/styles";
import { Color } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello world!</Text>
    </View>
  );
}