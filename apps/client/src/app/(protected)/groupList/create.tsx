import LabeledInput from "@/components/LabeledInput";
import { useCreateGroupScreenStyles } from "@/constants/styles/useCreateGroupScreenStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCreateGroupScreenViewModel } from "@/viewmodels/useCreateGroupScreenViewModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function CreateGroupScreen() {
  const { colors } = useAppTheme();
  const styles = useCreateGroupScreenStyles();
  const vm = useCreateGroupScreenViewModel();

  const displayInitials = vm.groupName.trim()
    ? vm.groupName.trim().charAt(0).toUpperCase()
    : "G";

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Circular Photo Header */}
          <View style={styles.photoSection}>
            <Pressable
              style={({ pressed }) => [
                styles.photoWrapper,
                pressed && { opacity: 0.8 },
              ]}
              onPress={vm.pickPhoto}
            >
              {vm.photoUri ? (
                <Image
                  source={{ uri: vm.photoUri }}
                  style={styles.photoImage}
                />
              ) : (
                <View style={styles.circlePlaceholder}>
                  <Text style={styles.initialsText}>{displayInitials}</Text>
                </View>
              )}
              <View style={styles.editButtonContainer}>
                <Ionicons name="camera" size={16} color={colors.onPrimary} />
              </View>
              {vm.photoUri && (
                <Pressable
                  style={styles.removePhotoButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    vm.setPhotoUri(null);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              )}
            </Pressable>
          </View>

          {/* Form Inputs */}
          <View style={styles.formGroup}>
            <LabeledInput
              label="Group Name *"
              value={vm.groupName}
              onChangeText={(text) => {
                vm.setGroupName(text);
                if (vm.error) vm.setError(null);
              }}
              placeholder="e.g. Work_Squad or my.group"
              autoCapitalize="none"
              isCorrect={vm.isGroupNameValid && vm.groupName.length > 0}
            />

            <LabeledInput
              label="Group Description"
              value={vm.description}
              onChangeText={(text) => {
                vm.setDescription(text);
                if (vm.error) vm.setError(null);
              }}
              placeholder="Describe your group..."
              autoCapitalize="sentences"
              isMultiLine={true}
              isCorrect={vm.isDescriptionValid && vm.description.length > 0}
            />

            {/* Validation Error Message */}
            {vm.error && <Text style={styles.errorText}>{vm.error}</Text>}
          </View>

          {/* Friends Selection Section */}
          <View style={styles.friendsSection}>
            <View style={styles.friendsHeader}>
              <Text style={styles.friendsLabel}>Friends</Text>
              <Pressable
                style={styles.addFriendButton}
                onPress={vm.openFriendsModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.friendsContainer}>
              {vm.selectedFriends.length === 0 ? (
                <View style={styles.emptyFriendsContainer}>
                  <Ionicons
                    name="people-outline"
                    size={36}
                    color={colors.placeholder}
                  />
                  <Text style={styles.emptyFriendsText}>
                    {"No friends selected yet.\nTap '+' to invite friends."}
                  </Text>
                </View>
              ) : (
                vm.selectedFriends.map((friend) => (
                  <View key={friend.username} style={styles.friendRow}>
                    <View style={styles.friendInfo}>
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>
                          {friend.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.friendUsernameText}>
                        {friend.username}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.removeFriendButton}
                      onPress={() => vm.removeFriend(friend.username)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.error}
                      />
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Create Button Footer */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.createButton,
                (!vm.isGroupNameValid || vm.isCreating) &&
                  styles.createButtonDisabled,
              ]}
              disabled={!vm.isGroupNameValid || vm.isCreating}
              onPress={vm.handleCreateGroup}
            >
              {vm.isCreating ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <Text style={styles.createButtonText}>Create</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Friends Selection Floating Modal */}
      <Modal
        visible={vm.isFriendsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => vm.setIsFriendsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => vm.setIsFriendsModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Friends</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => vm.setIsFriendsModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={colors.onSurfaceVariant}
                />
              </Pressable>
            </View>

            {vm.isFriendsLoading ? (
              <View style={styles.modalLoaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : vm.isFriendsError ? (
              <View style={styles.modalEmptyContainer}>
                <Text style={[styles.modalEmptyText, { color: colors.error }]}>
                  Failed to load friends list.
                </Text>
              </View>
            ) : vm.friends.length === 0 ? (
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
                data={vm.friends}
                keyExtractor={(item) => item.username}
                contentContainerStyle={styles.modalList}
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => {
                  const isChecked = vm.tempSelectedFriendUsernames.has(
                    item.username,
                  );
                  return (
                    <Pressable
                      style={styles.friendSelectRow}
                      onPress={() => vm.toggleFriendSelection(item.username)}
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
                onPress={() => vm.setIsFriendsModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalAddButton}
                onPress={vm.confirmFriendSelection}
              >
                <Text style={styles.modalAddButtonText}>Add</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
