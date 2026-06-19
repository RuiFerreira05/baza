import { GlobalStyles } from "@/constants/styles/global";
import { groupService } from "@/services/groupService";
import { GroupDTO } from "@baza/shared-types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";

export default function GroupsScreen() {
  // This was a valid uuid in my dev db, if you want to test this, you can create a group in your
  // dev db and use that id here. Or use pnpm seed.
  const groupId = "4ef01bb1-c74c-4fe9-bf07-9ee004004b24";

  const router = useRouter();
  const [group, setGroup] = useState<GroupDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  // This can only work if the server has BYPASS_AUTH enabled, otherwise it will return a 401
  // Unauthorized error. Also all of this should be handled by a viewmodel but it's just a demo so
  // we can skip that for now.
  const fetchGroup = async (groupId: string) => {
    setError(null);
    try {
      const result = await groupService.getGroup(groupId);
      if (result.ok) {
        setGroup(result.value);
      } else {
        setGroup(null);
        console.error(
          `Error fetching group: ${result.error.error.type} - ${result.error.error.message}`,
        );
        setError(
          `Error fetching group: ${result.error.error.type} - ${result.error.error.message}`,
        );
      }
    } catch (error) {
      setGroup(null);
      console.error(`Unexpected error: ${error}`);
      setError(`Unexpected error: ${error}`);
    }
  };

  useEffect(() => {
    fetchGroup(groupId);
  }, []);

  return (
    <View style={GlobalStyles.container}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Groups Screen</Text>
      {group ? (
        <View>
          <Text>Group ID: {group.id}</Text>
          <Text>Group Name: {group.groupname}</Text>
          <Text>Group Description: {group.description}</Text>
        </View>
      ) : error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : (
        <ActivityIndicator size="large" />
      )}

      <Button title="Refresh Group info" onPress={() => fetchGroup(groupId)} />

      <Button title="Back to Calendar" onPress={() => router.back()} />
    </View>
  );
}
