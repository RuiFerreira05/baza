import { useAppMutation } from "@/hooks/useAppMutation";
import { useAuthState } from "@/hooks/useAuthState";
import { queryClient } from "@/lib/queryClient";
import { groupService } from "@/services/groupService";
import { ErrorTypes } from "@baza/shared-types";
import { useState } from "react";
import Toast from "react-native-toast-message";

interface UseCreateGroupViewModelProps {
  onSuccess: () => void;
}

export function useCreateGroupViewModel({ onSuccess }: UseCreateGroupViewModelProps) {
  const { profile, bypassAuth } = useAuthState();
  const username = profile?.username || (bypassAuth ? "alice_smith" : "");

  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Group name validation regex: ^[A-Za-z0-9_\-\.]{3,64}$
  const groupNameRegex = /^[A-Za-z0-9_\-\.]{3,64}$/;
  const isGroupNameValid = groupNameRegex.test(groupName);

  const { mutateAsync: createGroup, isPending: isCreating } = useAppMutation({
    mutationFn: () => {
      setError(null);
      return groupService.createGroup({
        groupName: groupName.trim(),
      });
    },
    onSuccess: () => {
      if (username) {
        queryClient.invalidateQueries({
          queryKey: ["personal-groups", username],
        });
      }
      Toast.show({
        type: "success",
        text1: "Group Created!",
        text2: `Successfully created "${groupName.trim()}"`,
        position: "bottom",
        bottomOffset: 80,
      });
      onSuccess();
    },
    onError: (err) => {
      if (err.error.type === ErrorTypes.ExistingResourceError) {
        setError("A group with this name already exists.");
        return;
      }
      setError(err.error.message || "Failed to create group. Please try again.");
    },
  });

  const handleCreateGroup = async () => {
    if (!isGroupNameValid) {
      setError(
        "Group name must be between 3 and 64 characters and contain only letters, numbers, underscores, hyphens, or dots."
      );
      return;
    }
    try {
      await createGroup();
    } catch {
      // Handled by onError
    }
  };

  return {
    groupName,
    setGroupName,
    isGroupNameValid,
    isCreating,
    handleCreateGroup,
    error,
    setError,
  };
}
