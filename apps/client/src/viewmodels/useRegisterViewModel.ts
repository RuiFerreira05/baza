import { authClient } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useState } from "react";

export const useRegisterViewModel = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isNameValid = name.length > 0;
  const isEmailValid =
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/.test(
      email,
    );
  const isPasswordValid = password.length >= 8;
  const isConfirmPasswordValid =
    isPasswordValid && confirmPassword === password;
  const isFormValid =
    isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  const onSignUp = async () => {
    setError("");
    setLoading(true);
    if (!isFormValid) {
      setError("Please fill out all fields correctly.");
      setLoading(false);
      return;
    }
    authClient.signUp
      .email({
        name,
        email,
        password,
      })
      .then(() => {
        router.replace("/(protected)");
      })
      .catch((err) => {
        setError(err.message || "An error occurred during registration.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    onSignUp,
    loading,
    setLoading,
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isConfirmPasswordValid,
    isFormValid,
  };
};
