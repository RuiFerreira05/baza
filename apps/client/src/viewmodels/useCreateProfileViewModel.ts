import { useAppMutation } from "@/hooks/useAppMutation";
import { queryClient } from "@/lib/queryClient";
import { userService } from "@/services/userService";
import { ErrorTypes } from "@baza/shared-types";
import { useState } from "react";
import Toast from "react-native-toast-message";

export function useCreateProfileViewModel() {
  const [username, setUsername] = useState("");

  const isUsernameValid = username.length >= 3 && username.length <= 20;

  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createProfile, isPending: isCreating } = useAppMutation({
    mutationFn: () => {
      setError(null);
      return userService.createProfile({
        username: username.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-profile"] });
      Toast.show({
        type: "success",
        text1: "Profile Created!",
        text2: "Welcome to Baza!",
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

  return {
    username,
    setUsername,
    isUsernameValid,
    isCreating,
    onCreateProfile: createProfile,
    error,
  };
}
