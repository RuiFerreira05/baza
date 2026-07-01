import { authClient } from "@/lib/auth";
import { useState } from "react";

export const useLoginViewModel = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isIdentifierValid = identifier.length > 0;
  const isPasswordValid = password.length > 8;
  const isFormValid = isIdentifierValid && isPasswordValid;

  const onSignIn = async () => {
    setError("");
    setLoading(true);
    if (!isFormValid) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await authClient.signIn.email({
        email: identifier,
        password,
        rememberMe: true,
      });

      if (authError) {
        setError(authError.message || "An error occurred during login.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred during login.");
    } finally {
      setLoading(false);
    }
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
