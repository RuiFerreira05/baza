import { useAppMutation } from "@/hooks/useAppMutation";
import { queryClient } from "@/lib/queryClient";
import { userService } from "@/services/userService";
import { ErrorTypes } from "@baza/shared-types";
import { ProfileDTO } from "@baza/shared-types/src/protocol/users";
import { useRouter } from "expo-router";
import { useState } from "react";
import Toast from "react-native-toast-message";

export function useEditProfileViewModel(
  profile: ProfileDTO,
  bypassAuth: boolean,
) {
  const router = useRouter();

  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [descriptionInput, setDescriptionInput] = useState(profile.description);
  const [photoInput, setPhotoInput] = useState(profile.photo);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState(
    bypassAuth || !profile?.photo ? null : profile?.photo,
  );

  const isUsernameValid =
    usernameInput.length >= 3 && usernameInput.length <= 20;

  const { mutateAsync: editProfile, isPending: isEditing } = useAppMutation({
    mutationFn: () => {
      setError(null);
      return userService.editProfile(profile.username, {
        newUsername:
          usernameInput !== profile.username ? usernameInput.trim() : undefined,
        newDescription:
          descriptionInput !== profile.description
            ? descriptionInput?.trim()
            : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-profile"] });
      Toast.show({
        type: "success",
        text1: "Profile Updated!",
        text2: "Your profile has been updated successfully.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
    onError: (err) => {
      if (err.error.type === ErrorTypes.ExistingResourceError) {
        setError("This username is already taken. Please choose another one.");
        return;
      }
      setError(err.error.message || "Please try a different username");
    },
  });

  const { mutateAsync: editPhoto, isPending: isEditingPhoto } = useAppMutation({
    mutationFn: () => {
      setError(null);
      if (image) {
        return userService.editProfilePhoto(profile.username, image);
      } else {
        return userService.deleteProfilePhoto(profile.username);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-profile-photo"] });
      Toast.show({
        type: "success",
        text1: "Profile photo Updated!",
        text2: "Your profile photo has been updated successfully.",
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
    usernameInput,
    setUsernameInput,
    descriptionInput,
    setDescriptionInput,
    photoInput,
    setPhotoInput,
    isUsernameValid,
    error,
    editProfile,
    isEditing,
    image,
    setImage,
    editPhoto,
    isEditingPhoto,
  };
}
