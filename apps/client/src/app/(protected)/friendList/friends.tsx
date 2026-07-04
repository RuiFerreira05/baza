import FriendCard from "@/components/FriendCard";
import RemoveFriendModal from "@/components/RemoveFriendModal";
import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { userService } from "@/services/userService";
import { useFriendListViewModel } from "@/viewmodels/useFriendListViewModel";
import { ProfileDTO } from "@baza/shared-types";
import FontAwesome from "@expo/vector-icons/FontAwesome5";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendsScreen() {
  const styles = useFriendsStyles();
  const { colors } = useAppTheme();
  const vm = useFriendListViewModel();
  const { profile, bypassAuth } = useAuthState();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileDTO[]>([]);

  useFocusEffect(
    useCallback(() => {
      vm.refetch();
    }, []),
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const formattedQuery = query.toLowerCase();
    const filteredData = vm.friends.filter((friend) => {
      return RegExp(formattedQuery, "gim").exec(friend.username);
    });
    setSearchResults(filteredData);
  };

  const removeFriend = (user: string, friend: string) => {
    userService.removeFriend(user, friend);
    setIsModalVisible(false);
    vm.refetch();
  };

  if (vm.isLoading && vm.friends.length === 0) {
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
            {vm.error?.message || "Failed to load friends."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Search"
        autoCapitalize="none"
        autoCorrect={false}
        value={searchQuery}
        onChangeText={(query) => handleSearch(query)}
        style={styles.searchBar}
      />
      <FlatList
        data={searchQuery ? searchResults : vm.friends}
        keyExtractor={(item) => item.username}
        renderItem={({ item }) => (
          <View>
            <FriendCard
              username={item.username}
              photo={item.photo}
              updatedAt={item.updatedAt}
              setModalVisible={setIsModalVisible}
              setSelected={setSelected}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <FontAwesome name="sad-cry" size={48} color={colors.placeholder} />
            <Text style={styles.emptyStateTitle}>No Friends Yet</Text>
            <Text style={styles.emptyStateSub}>
              {
                "You don't have any friends yet. When users accept your friend requests or when you accept theirs , they will show up here."
              }
            </Text>
          </View>
        }
      ></FlatList>
      <RemoveFriendModal
        friendName={selected}
        modalVisible={isModalVisible}
        onBackPress={() => setIsModalVisible(false)}
        onRemovePress={() =>
          bypassAuth || !profile
            ? setIsModalVisible(false)
            : removeFriend(profile.username, selected)
        }
        onCancelPress={() => setIsModalVisible(false)}
        onRequestClose={() => setIsModalVisible(false)}
        isLoading={false}
      />
    </SafeAreaView>
  );
}
