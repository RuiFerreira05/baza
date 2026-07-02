import CreateGroupModal from "@/components/CreateGroupModal";
import GroupCard from "@/components/GroupCard";
import { useCreateEventStyles } from "@/constants/styles/useCreateEventStyles";
import { useGroupListStyles } from "@/constants/styles/useGroupListStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGroupListViewModel } from "@/viewmodels/useGroupListViewModel";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export default function GroupList() {
  const { colors } = useAppTheme();
  const styles = useGroupListStyles();
  const formStyles = useCreateEventStyles();
  const vm = useGroupListViewModel();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    <View style={styles.container}>
      <FlatList
        data={vm.groups}
        keyExtractor={(group) => group.id}
        contentContainerStyle={styles.listContent}
        refreshing={vm.isLoading}
        onRefresh={vm.refetch}
        renderItem={({ item }) => (
          <GroupCard
            groupname={item.groupname}
            description={item.description}
          />
        )}
        ListEmptyComponent={
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
        }
      />

      {/* Floating Action Button (FAB) */}
      <Pressable
        style={({ pressed }) => [formStyles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => setIsCreateModalOpen(true)}
      >
        <Ionicons name="add" size={30} color={colors.onPrimary} />
      </Pressable>

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <CreateGroupModal
          visible={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            vm.refetch();
          }}
        />
      )}
    </View>
  );
}
