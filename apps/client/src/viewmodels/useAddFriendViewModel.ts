import { useAppMutation } from "@/hooks/useAppMutation";
import { useAuthState } from "@/hooks/useAuthState";
import { queryClient } from "@/lib/queryClient";
import { userService } from "@/services/userService";
import { useState } from "react";
import Toast from "react-native-toast-message";

export function useAddFriendViewModel() {
  const { bypassAuth, profile } = useAuthState();
  const username =
    profile?.username || (bypassAuth ? "alice_smith" : undefined);
  const [usernameInput, setUsernameInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isUsernameValid =
    usernameInput.length >= 3 && usernameInput.length <= 20;

  const { mutateAsync: sendRequest, isPending: isSending } = useAppMutation({
    mutationFn: () => {
      setError(null);
      return userService.sendFriendRequest(username!, {
        recipientUsername: usernameInput,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["send-friend-request", username],
      });
      Toast.show({
        type: "success",
        text1: "Friend request sent!",
        text2: "Your friend request has been sent successfully.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to send to request.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
  });

  return {
    usernameInput,
    setUsernameInput,
    isUsernameValid,
    error,
    sendRequest,
    isSending,
  };
}
