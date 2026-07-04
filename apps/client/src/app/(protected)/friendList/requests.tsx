import FriendRequestCard from "@/components/FriendRequestCard";
import { useGroupListStyles } from "@/constants/styles/useGroupListStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFriendRequestsViewModel } from "@/viewmodels/useFriendRequestViewmodel";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function FriendRequests() {
  const { colors } = useAppTheme();
  const styles = useGroupListStyles();
  const vm = useFriendRequestsViewModel();

  if (vm.isLoading && vm.requests.length === 0) {
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

  const formatDate = (date: Date) => {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={vm.requests}
        keyExtractor={(request) => request.requestSentAt}
        contentContainerStyle={styles.listContent}
        refreshing={vm.isLoading}
        onRefresh={vm.refetch}
        renderItem={({ item }) => (
          <FriendRequestCard
            otherUser={item.sender.username}
            sentAt={formatDate(new Date(item.requestSentAt))}
            onAccept={() =>
              vm.respondToRequest(item.sender.username, "accepted")
            }
            onDecline={() =>
              vm.respondToRequest(item.sender.username, "declined")
            }
            isResponding={vm.isResponding}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <FontAwesome
              name="face-grin-beam-sweat"
              size={48}
              color={colors.placeholder}
            />
            <Text style={styles.emptyStateTitle}>No Pending Requests</Text>
            <Text style={styles.emptyStateSub}>
              {"You don't have any pending friend requests at the moment."}
            </Text>
          </View>
        }
      />
    </View>
  );
}
