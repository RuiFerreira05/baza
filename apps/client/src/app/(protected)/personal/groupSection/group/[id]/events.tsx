import GroupEventHubCard from "@/components/GroupEventHubCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  FormattedGroupEvent,
  useGroupEventsViewModel,
} from "@/viewmodels/useGroupEventsViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
export default function GroupEventsHubScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const vm = useGroupEventsViewModel();

  const [searchQuery, setSearchQuery] = useState("");

  // Filter events based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return vm.sections;

    const query = searchQuery.toLowerCase().trim();

    return vm.sections.map((section) => {
      const filteredData = section.data.filter(
        (item) =>
          item.event.title.toLowerCase().includes(query) ||
          item.creator.toLowerCase().includes(query) ||
          (item.event.description &&
            item.event.description.toLowerCase().includes(query)) ||
          (item.planTitle && item.planTitle.toLowerCase().includes(query)),
      );
      return {
        ...section,
        data: filteredData,
      };
    });
  }, [vm.sections, searchQuery]);

  const renderSectionHeader = ({
    section: { title, data },
  }: {
    section: { title: string; data: FormattedGroupEvent[] };
  }) => {
    // Hide section headers if the section has no items matching the search query
    if (data.length === 0) return null;

    return (
      <View
        style={[styles.sectionHeader, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
          {title} ({data.length})
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: FormattedGroupEvent }) => {
    return (
      <GroupEventHubCard
        item={item}
        onPress={() => {
          router.push(
            `/(protected)/personal/groupSection/group/${vm.groupId}/event/${item.event.id}/details` as any,
          );
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.placeholder} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          placeholder="Search events by title or creator..."
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.placeholder}
            />
          </Pressable>
        )}
      </View>

      {/* Main List */}
      {vm.isLoading && filteredSections.every((s) => s.data.length === 0) ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : vm.error ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.error }}>{vm.error}</Text>
        </View>
      ) : (
        <SectionList
          sections={
            filteredSections.every((s) => s.data.length === 0)
              ? []
              : filteredSections
          }
          keyExtractor={(item) => item.event.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          refreshing={vm.isLoading}
          onRefresh={vm.refetchEvents}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-outline"
                size={64}
                color={colors.placeholder}
              />
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                {searchQuery.trim()
                  ? "No Results Found"
                  : "No Events Scheduled"}
              </Text>
              <Text
                style={[styles.emptySub, { color: colors.onSurfaceVariant }]}
              >
                {searchQuery.trim()
                  ? "We couldn't find any events matching your search terms. Try modifying your query."
                  : "There are no active or past events in this group yet. Go to the Calendar tab and tap the '+' button to plan your first group event!"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
});
