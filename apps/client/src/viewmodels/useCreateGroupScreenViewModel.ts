import { useAppMutation } from "@/hooks/useAppMutation";
import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuthState } from "@/hooks/useAuthState";
import { queryClient } from "@/lib/queryClient";
import { groupService } from "@/services/groupService";
import { userService } from "@/services/userService";
import { ErrorTypes, ProfileDTO } from "@baza/shared-types";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import Toast from "react-native-toast-message";

export function useCreateGroupScreenViewModel() {
  const router = useRouter();
  const { profile, bypassAuth } = useAuthState();
  const username = profile?.username || (bypassAuth ? "alice_smith" : "");

  // States
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<ProfileDTO[]>([]);
  const [isFriendsModalVisible, setIsFriendsModalVisible] = useState(false);
  const [tempSelectedFriendUsernames, setTempSelectedFriendUsernames] =
    useState<Set<string>>(new Set());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Group name validation regex: ^[A-Za-z0-9_\-\.]{3,64}$
  const groupNameRegex = /^[A-Za-z0-9_\-\.]{3,64}$/;
  const isGroupNameValid = groupNameRegex.test(groupName);

  // Description length validation
  const isDescriptionValid = description.length <= 500;

  // Fetch Friends List
  const friendsQuery = useAppQuery({
    queryKey: ["user-friends", username],
    queryFn: () => userService.getFriends(username),
    enabled: !!username,
  });

  const friends = useMemo(() => {
    return friendsQuery.data ?? [];
  }, [friendsQuery.data]);

  // Group creation mutation
  const { mutateAsync: createGroup, isPending: isCreating } = useAppMutation({
    mutationFn: () => {
      setError(null);
      return groupService.createGroup({
        groupName: groupName.trim(),
        description: description.trim() || undefined,
      });
    },
    onError: (err) => {
      if (err.error?.type === ErrorTypes.ExistingResourceError) {
        setError("A group with this name already exists.");
      } else {
        setError(
          err.error?.message || "Failed to create group. Please try again.",
        );
      }
    },
  });

  // Modal actions
  const openFriendsModal = () => {
    // Pre-populate with currently selected friends
    setTempSelectedFriendUsernames(
      new Set(selectedFriends.map((f) => f.username)),
    );
    setIsFriendsModalVisible(true);
  };

  const pickPhoto = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error picking photo",
        text2: err.message,
        position: "bottom",
        bottomOffset: 80,
      });
    }
  };

  const toggleFriendSelection = (friendUsername: string) => {
    const nextSet = new Set(tempSelectedFriendUsernames);
    if (nextSet.has(friendUsername)) {
      nextSet.delete(friendUsername);
    } else {
      nextSet.add(friendUsername);
    }
    setTempSelectedFriendUsernames(nextSet);
  };

  const confirmFriendSelection = () => {
    // Match the selected usernames against the full friends list
    const newlySelected = friends.filter((f) =>
      tempSelectedFriendUsernames.has(f.username),
    );
    setSelectedFriends(newlySelected);
    setIsFriendsModalVisible(false);
  };

  const removeFriend = (friendUsername: string) => {
    setSelectedFriends((prev) =>
      prev.filter((f) => f.username !== friendUsername),
    );
  };

  // Submit flow
  const handleCreateGroup = async () => {
    if (!isGroupNameValid) {
      setError(
        "Group name must be between 3 and 64 characters and contain only letters, numbers, underscores, hyphens, or dots.",
      );
      return;
    }
    if (!isDescriptionValid) {
      setError("Group description cannot exceed 500 characters.");
      return;
    }

    try {
      // 1. Submit Group Name & Description
      const newGroup = await createGroup();
      const groupId = newGroup.id;

      // 2. Upload Group Photo if selected
      if (photoUri) {
        const formData = new FormData();
        const filename = photoUri.split("/").pop() || "group_photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append("photo", {
          uri: photoUri,
          name: filename,
          type: type,
        } as any);

        const photoResult = await groupService.uploadGroupPhoto(
          groupId,
          formData,
        );
        if (!photoResult.ok) {
          Toast.show({
            type: "error",
            text1: "Photo Upload Failed",
            text2:
              photoResult.error.error.message ||
              "Failed to upload group photo.",
            position: "bottom",
            bottomOffset: 80,
          });
        }
      }

      // 3. Batch Invite selected friends
      if (selectedFriends.length > 0) {
        const inviteUsernames = selectedFriends.map((f) => f.username);
        const inviteResult = await groupService.batchInviteUsers(
          groupId,
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
          // Identify any users not returned in the success list
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

      // 3. Invalidate TanStack Query Cache
      if (username) {
        queryClient.invalidateQueries({
          queryKey: ["personal-groups", username],
        });
      }

      // 4. Show success toast and redirect
      Toast.show({
        type: "success",
        text1: "Group Created!",
        text2: `Successfully created "${newGroup.groupname}"`,
        position: "bottom",
        bottomOffset: 80,
      });

      // Clear local screen state
      setGroupName("");
      setDescription("");
      setSelectedFriends([]);
      setPhotoUri(null);

      router.replace(`/(protected)/personal/groupSection/groupList/groups`);
    } catch {
      // Error handled by onError mutation option
    }
  };

  return {
    groupName,
    setGroupName,
    description,
    setDescription,
    selectedFriends,
    isFriendsModalVisible,
    setIsFriendsModalVisible,
    tempSelectedFriendUsernames,
    isGroupNameValid,
    isDescriptionValid,
    isCreating,
    error,
    setError,
    friends,
    isFriendsLoading: friendsQuery.isLoading,
    isFriendsError: friendsQuery.isError,
    photoUri,
    setPhotoUri,
    pickPhoto,
    openFriendsModal,
    toggleFriendSelection,
    confirmFriendSelection,
    removeFriend,
    handleCreateGroup,
  };
}
