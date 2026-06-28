import { useRouter } from "expo-router";
import { useState } from "react";

export const useLoginViewModel = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isIdentifierValid = identifier.length > 0;
  const isPasswordValid = password.length > 8;
  const isFormValid = isIdentifierValid && isPasswordValid;

  const onSignIn = async () => {
    setError("");
    setLoading(true);
    if (!isFormValid) {
      setError("Please fill out all fields.");
      return;
    }
    // authClient.signIn({
    //
    // })
    router.replace("/(protected)");
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    setError,
    loading,
    setLoading,
    onSignIn,
    isIdentifierValid,
    isPasswordValid,
    isFormValid,
  };
};
