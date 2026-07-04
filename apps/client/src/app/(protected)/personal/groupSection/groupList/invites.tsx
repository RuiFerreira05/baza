import GroupInviteCard from "@/components/GroupInviteCard";
import { useGroupListStyles } from "@/constants/styles/useGroupListStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGroupInvitesViewModel } from "@/viewmodels/useGroupInvitesViewModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function GroupInvites() {
  const { colors } = useAppTheme();
  const styles = useGroupListStyles();
  const vm = useGroupInvitesViewModel();

  if (vm.isLoading && vm.invites.length === 0) {
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
            {vm.error?.message || "Failed to load invites."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vm.invites}
        keyExtractor={(group) => group.id}
        contentContainerStyle={styles.listContent}
        refreshing={vm.isLoading}
        onRefresh={vm.refetch}
        renderItem={({ item }) => (
          <GroupInviteCard
            groupname={item.groupname}
            description={item.description}
            onAccept={() => vm.respondToInvite(item.id, "accepted")}
            onDecline={() => vm.respondToInvite(item.id, "declined")}
            isResponding={vm.isResponding}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name="mail-unread-outline"
              size={48}
              color={colors.placeholder}
            />
            <Text style={styles.emptyStateTitle}>No Pending Invites</Text>
            <Text style={styles.emptyStateSub}>
              {"You don't have any pending group invitations at the moment."}
            </Text>
          </View>
        }
      />
    </View>
  );
}
