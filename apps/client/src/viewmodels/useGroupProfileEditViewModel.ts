import { useAppMutation } from "@/hooks/useAppMutation";
import { queryClient } from "@/lib/queryClient";
import { groupService } from "@/services/groupService";
import { ErrorTypes, GroupDTO } from "@baza/shared-types";
import { useState } from "react";
import Toast from "react-native-toast-message";

export function useGroupEditProfileViewModel(group: GroupDTO) {
  const [groupNameInput, setGroupNameInput] = useState(group.groupname);
  const [descriptionInput, setDescriptionInput] = useState(group.description);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [image, setImage] = useState(
    !group.photo
      ? null
      : groupService.getGroupPhotoUrl(group.id, group.updatedAt),
  );

  const saveImage = async (image: string | null) => {
    try {
      setImage(image);
      editPhoto(image);
      setIsModalVisible(false);
    } catch (error) {
      throw error;
    }
  };

  const groupNameRegex = /^[A-Za-z0-9_\-\.]{3,64}$/;
  const isGroupNameValid = groupNameRegex.test(groupNameInput!);

  const { mutateAsync: editProfile, isPending: isEditing } = useAppMutation({
    mutationFn: () => {
      setError(null);
      return groupService.editGroup(group.id, {
        groupName:
          groupNameInput !== group.groupname
            ? groupNameInput!.trim()
            : undefined,
        description:
          descriptionInput !== group.description
            ? descriptionInput?.trim()
            : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", group.id] });
      Toast.show({
        type: "success",
        text1: "Group Updated!",
        text2: "Your group has been updated successfully.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
    onError: (err) => {
      if (err.error.type === ErrorTypes.ExistingResourceError) {
        setError(
          "This group name is already taken. Please choose another one.",
        );
        return;
      }
      setError(err.error.message || "Please try a different username");
    },
  });

  const { mutateAsync: editPhoto, isPending: isEditingPhoto } = useAppMutation({
    mutationFn: (currentImage: string | null) => {
      setError(null);
      if (currentImage) {
        return groupService.editGroupProfilePhoto(group.id, currentImage);
      } else {
        return groupService.deleteProfilePhoto(group.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", group.id] });
      queryClient.invalidateQueries({ queryKey: ["group-photo", group.id] });

      if (image) {
        setImage(
          groupService.getGroupPhotoUrl(group.id, new Date().toISOString()),
        );
      }
      Toast.show({
        type: "success",
        text1: "Group photo Updated!",
        text2: "Your group profile photo has been updated successfully.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
    onError: (err) => {
      if (err.error.type === ErrorTypes.UpdateError) {
        setError("Couldn't update photo.");
        return;
      }
      setError(err.error.message);
    },
  });

  return {
    groupNameInput,
    setGroupNameInput,
    descriptionInput,
    setDescriptionInput,
    isGroupNameValid,
    error,
    editProfile,
    isEditing,
    editPhoto,
    isEditingPhoto,
    isModalVisible,
    setIsModalVisible,
    saveImage,
    image,
    setImage,
  };
}
