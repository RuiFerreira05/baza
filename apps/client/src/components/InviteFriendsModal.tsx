import { useCreateGroupScreenStyles } from "@/constants/styles/useCreateGroupScreenStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { groupService } from "@/services/groupService";
import { useGroupMembersViewModel } from "@/viewmodels/useGroupMembersViewModel";
import { GroupDTO, ProfileDTO } from "@baza/shared-types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface InviteFriendsModalProps {
  group: GroupDTO;
  userFriends: ProfileDTO[];
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InviteFriendsModal({
  group,
  userFriends,
  isModalVisible,
  setModalVisible,
}: InviteFriendsModalProps) {
  const styles = useCreateGroupScreenStyles();
  const { colors } = useAppTheme();
  const vm = useGroupMembersViewModel(group);

  const [selectedFriends, setSelectedFriends] = useState<ProfileDTO[]>([]);
  const [tempSelectedFriendUsernames, setTempSelectedFriendUsernames] =
    useState<Set<string>>(new Set());

  console.log(userFriends);

  const toggleFriendSelection = (friendUsername: string) => {
    const nextSet = new Set(tempSelectedFriendUsernames);
    if (nextSet.has(friendUsername)) {
      nextSet.delete(friendUsername);
    } else {
      nextSet.add(friendUsername);
    }
    setTempSelectedFriendUsernames(nextSet);
  };

  const confirmFriendSelection = async () => {
    const newlySelected = userFriends.filter((f) =>
      tempSelectedFriendUsernames.has(f.username),
    );
    setSelectedFriends(newlySelected);
    if (selectedFriends.length > 0) {
      const inviteUsernames = selectedFriends.map((f) => f.username);
      const inviteResult = await groupService.batchInviteUsers(
        group.id,
        inviteUsernames,
      );

      if (!inviteResult.ok) {
        Toast.show({
          type: "error",
          text1: "Invitations Failed",
          text2:
            inviteResult.error.error.message ||
            "Failed to invite selected friends.",
          position: "bottom",
          bottomOffset: 80,
        });
      } else {
        const invitedUsernames = inviteResult.value.map((m) => m.username);
        const failedUsernames = inviteUsernames.filter(
          (u) => !invitedUsernames.includes(u),
        );

        if (failedUsernames.length > 0) {
          Toast.show({
            type: "error",
            text1: "Some invites failed",
            text2: `Could not invite: ${failedUsernames.join(", ")}`,
            position: "bottom",
            bottomOffset: 80,
          });
        }
      }
    }
    setModalVisible(false);
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Friends</Text>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          </View>

          {vm.isLoading ? (
            <View style={styles.modalLoaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : vm.isError ? (
            <View style={styles.modalEmptyContainer}>
              <Text style={[styles.modalEmptyText, { color: colors.error }]}>
                Failed to load friends list.
              </Text>
            </View>
          ) : vm.members.length === 0 ? (
            <View style={styles.modalEmptyContainer}>
              <Ionicons
                name="people-outline"
                size={36}
                color={colors.placeholder}
              />
              <Text style={styles.modalEmptyText}>
                No friends found.{"\n"}Add some friends first!
              </Text>
            </View>
          ) : (
            <FlatList
              data={userFriends}
              keyExtractor={(item) => item.username}
              contentContainerStyle={styles.modalList}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => {
                const isChecked = tempSelectedFriendUsernames.has(
                  item.username,
                );
                return (
                  <Pressable
                    style={styles.friendSelectRow}
                    onPress={() => toggleFriendSelection(item.username)}
                  >
                    <View style={styles.friendInfo}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>
                          {item.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.friendUsernameText}>
                        {item.username}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.selectionBox,
                        isChecked && styles.selectionBoxChecked,
                      ]}
                    >
                      {isChecked && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={colors.onPrimary}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              }}
            />
          )}

          <View style={styles.modalFooter}>
            <Pressable
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.modalAddButton}
              onPress={confirmFriendSelection}
            >
              <Text style={styles.modalAddButtonText}>Invite</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
