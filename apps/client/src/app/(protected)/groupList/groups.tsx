import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useGroupListViewModel } from "@/viewmodels/useGroupListViewModel";
import { Text } from "@react-navigation/elements";
import { View } from "react-native";

export default function GroupList() {
  const styles = useGlobalStyles();
  const vm = useGroupListViewModel();

  return (
    <View style={styles.container}>
      <Text>Group List</Text>
    </View>
  );
}
