import GroupCard from "@/components/GroupCard";
import LabeledInput from "@/components/LabeledInput";
import { useGroupListStyles } from "@/constants/styles/useGroupListStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGroupListViewModel } from "@/viewmodels/useGroupListViewModel";
import { GroupDTO } from "@baza/shared-types";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupList() {
  const { colors } = useAppTheme();
  const styles = useGroupListStyles();
  const vm = useGroupListViewModel();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GroupDTO[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const formattedQuery = query.toLowerCase();
    const filteredData = vm.groups.filter((group) => {
      return RegExp(formattedQuery, "gim").exec(group.groupname);
    });
    setSearchResults(filteredData);
  };

  if (vm.isLoading && vm.groups.length === 0) {
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
            {vm.error?.message || "Failed to load groups."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LabeledInput
        onChangeText={handleSearch}
        value={searchQuery}
        autoCorrect={false}
        autoCapitalize="none"
        placeholder="Search for groups"
        isCorrect={false}
        isEnabled={true}
      />
      <FlatList
        data={searchQuery ? searchResults : vm.groups}
        keyExtractor={(group) => group.id}
        contentContainerStyle={styles.listContent}
        refreshing={vm.isLoading}
        onRefresh={vm.refetch}
        renderItem={({ item }) => (
          <GroupCard
            id={item.id}
            groupname={item.groupname}
            description={item.description}
            photo={item.photo}
          />
        )}
        ListEmptyComponent={
          vm.groups.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons
                name="people-outline"
                size={48}
                color={colors.placeholder}
              />
              <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
              <Text style={styles.emptyStateSub}>
                {
                  "You aren't a member of any groups. When you join or are invited to a group, they will show up here."
                }
              </Text>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <FontAwesome
                name="face-meh"
                size={48}
                color={colors.placeholder}
              />
              <Text style={styles.emptyStateTitle}>No results</Text>
              <Text style={styles.emptyStateSub}>
                {"No groups matched your search. Try a different one!"}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
