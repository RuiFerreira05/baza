import { useGlobalStyles } from "@/constants/styles/useGlobalStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGroupsViewModel } from "@/viewmodels/useGroupsViewModel";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function GroupsScreen() {
  const styles = useGlobalStyles();
  const { colors } = useAppTheme();
  // This was a valid uuid in my dev db, if you want to test this, you can create a group in your
  // dev db and use that id here. Or use pnpm seed.
  const groupId = "6ee23ba4-1ca5-4def-924f-cd5ef15b27f0";

  const vm = useGroupsViewModel(groupId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Groups Screen</Text>
      {vm.group ? (
        <View style={{ gap: 8 }}>
          <Text style={styles.text}>Group ID: {vm.group.id}</Text>
          <Text style={styles.text}>Group Name: {vm.group.groupname}</Text>
          <Text style={styles.text}>
            Group Description: {vm.group.description}
          </Text>
        </View>
      ) : vm.error ? (
        <Text style={{ color: colors.error }}>{vm.error}</Text>
      ) : vm.isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Text style={styles.text}>No group found.</Text>
      )}

      <Button title="Refresh Group info" onPress={vm.refetchGroup} />

      <Button title="Back to Calendar" onPress={vm.goBack} />
    </View>
  );
}
