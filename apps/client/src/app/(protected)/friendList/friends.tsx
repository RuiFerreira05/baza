import FriendCard from "@/components/FriendCard";
import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFriendListViewModel } from "@/viewmodels/useFriendListViewModel";
import { ProfileDTO } from "@baza/shared-types";
import { useState } from "react";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileDTO[]>([]);
  console.log("search: " + searchResults);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const formattedQuery = query.toLowerCase();
    const filteredData = vm.friends.filter((friend) => {
      return RegExp(formattedQuery, "gim").exec(friend.username);
    });
    setSearchResults(filteredData);
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
      {/* <Text>Friends Screen</Text> */}
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
            />
          </View>
        )}
      ></FlatList>
    </SafeAreaView>
  );
}
