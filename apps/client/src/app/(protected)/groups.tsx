import { GlobalStyles } from "@/constants/styles/global";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function GroupsScreen() {
  const router = useRouter();

  return (
    <View style={GlobalStyles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Groups Screen</Text>

      <Button title="Back to Calendar" onPress={() => router.back()} />
    </View>
  );
}
