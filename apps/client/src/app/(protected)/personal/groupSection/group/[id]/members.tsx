import BasicModal from "@/components/BasicModal";
import LabeledInput from "@/components/LabeledInput";
import MemberCard from "@/components/MemberCard";
import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { useGroupInfo } from "@/hooks/useGroupInfo";
import { groupService } from "@/services/groupService";
import { useGroupMembersViewModel } from "@/viewmodels/useGroupMembersViewModel";
import { GroupMemberDTO } from "@baza/shared-types";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MembersScreen() {
  const styles = useFriendsStyles();
  const { colors } = useAppTheme();
  const { profile, bypassAuth } = useAuthState();
  const { data, error, isLoading } = useGroupInfo();

  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isBanModalVisible, setIsBanModalVisible] = useState(false);
  const [isUnBanModalVisible, setIsUnBanModalVisible] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GroupMemberDTO[]>([]);

  const vm = useGroupMembersViewModel(
    data ?? {
      groupname: "Developers",
      photo: null,
      description: "Just a developer profile",
      id: "fKagbUx7LwvE72kxf0PL7cdd7AjncKBT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );

  useFocusEffect(
    useCallback(() => {
      vm.refetch();
    }, []),
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const formattedQuery = query.toLowerCase();
    const filteredData = vm.members.filter((member) => {
      return RegExp(formattedQuery, "gim").exec(member.username);
    });
    setSearchResults(filteredData);
  };

  const removeMember = (member: string) => {
    groupService.removeUser(data!.id, member);
    setIsRemoveModalVisible(false);
    vm.refetch();
  };

  const updateBanStatus = (member: string, banned: boolean) => {
    groupService.updateMemberBan(data!.id, member, { banned: banned });
    setIsBanModalVisible(false);
    setIsUnBanModalVisible(false);
    vm.refetch();
  };

  const isAdmin = () => {
    let isAdmin = false;
    vm.members?.forEach((member) => {
      if (member.username === profile?.username && member.admin) {
        isAdmin = true;
      }
    });
    return isAdmin;
  };

  if (vm.isLoading && vm.members.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (vm.isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {vm.error?.message || "Failed to load members."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LabeledInput
        // label="search"
        onChangeText={handleSearch}
        value={searchQuery}
        autoCorrect={false}
        autoCapitalize="none"
        placeholder="Search for members"
        isCorrect={false}
        isEnabled={true}
      />
      <FlatList
        style={{ paddingTop: 32 }}
        data={searchQuery ? searchResults : vm.members}
        keyExtractor={(item) => item.username}
        refreshing={vm.isLoading}
        onRefresh={vm.refetch}
        renderItem={({ item }) => (
          <MemberCard
            username={item.username}
            isMemberAdmin={item.admin}
            isAdmin={isAdmin()}
            isBanned={item.banned}
            setRemoteModalVisible={setIsRemoveModalVisible}
            setBanModalVisible={setIsBanModalVisible}
            setUnBanModalVisible={setIsUnBanModalVisible}
            setSelected={setSelected}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <FontAwesome name="face-meh" size={48} color={colors.placeholder} />
            <Text style={styles.emptyStateTitle}>No results</Text>
            <Text style={styles.emptyStateSub}>
              {"No members matched your search. Try a different one!"}
            </Text>
          </View>
        }
      ></FlatList>
      <BasicModal
        modalText={`Remove ${selected} from group?`}
        actionText="Remove"
        modalVisible={isRemoveModalVisible}
        onBackPress={() => setIsRemoveModalVisible(false)}
        onActionPress={() =>
          bypassAuth || !profile
            ? setIsRemoveModalVisible(false)
            : removeMember(selected)
        }
        onCancelPress={() => setIsRemoveModalVisible(false)}
        onRequestClose={() => setIsRemoveModalVisible(false)}
        isLoading={false}
      />
      <BasicModal
        modalText={`Ban ${selected} from group?`}
        actionText="Ban"
        modalVisible={isBanModalVisible}
        onBackPress={() => setIsBanModalVisible(false)}
        onActionPress={() =>
          bypassAuth || !profile
            ? setIsBanModalVisible(false)
            : updateBanStatus(selected, true)
        }
        onCancelPress={() => setIsBanModalVisible(false)}
        onRequestClose={() => setIsBanModalVisible(false)}
        isLoading={false}
      />
      <BasicModal
        modalText={`Unban ${selected} from group?`}
        actionText="Unban"
        modalVisible={isUnBanModalVisible}
        onBackPress={() => setIsUnBanModalVisible(false)}
        onActionPress={() =>
          bypassAuth || !profile
            ? setIsUnBanModalVisible(false)
            : updateBanStatus(selected, false)
        }
        onCancelPress={() => setIsUnBanModalVisible(false)}
        onRequestClose={() => setIsUnBanModalVisible(false)}
        isLoading={false}
      />
    </SafeAreaView>
  );
}
