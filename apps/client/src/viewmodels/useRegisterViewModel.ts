import { authClient } from "@/lib/auth";
import { env } from "@/lib/env";
import { useState } from "react";

export const useRegisterViewModel = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "An error occurred during registration.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const webClientId = env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

      // 1. If Web Client ID is present, attempt Native Google Sign-in
      if (webClientId) {
        const { GoogleOneTapSignIn, isSuccessResponse, isNoSavedCredentialFoundResponse } = 
          require("react-native-nitro-google-signin");

        GoogleOneTapSignIn.configure({ webClientId });

        let response = await GoogleOneTapSignIn.signIn();

        if (isNoSavedCredentialFoundResponse(response)) {
          response = await GoogleOneTapSignIn.createAccount();
        }

        if (isSuccessResponse(response) && response.data?.idToken) {
          const { error: authError } = await authClient.signIn.social({
            provider: "google",
            idToken: {
              token: response.data.idToken,
            },
          });

          if (authError) {
            setError(authError.message || "Better-Auth verification failed.");
          }
          return;
        }
      }

      // 2. Browser-based OAuth redirect fallback (for web, simulators, or if no client ID is set)
      const { error: authError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "baza://",
      });

      if (authError) {
        setError(authError.message || "An error occurred during Google sign-in.");
      }
    } catch (err: any) {
      try {
        const { error: authError } = await authClient.signIn.social({
          provider: "google",
          callbackURL: "baza://",
        });
        if (authError) {
          setError(authError.message || "An error occurred during fallback Google sign-in.");
        }
      } catch (fallbackErr: any) {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
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
    onGoogleSignIn,
    loading,
    setLoading,
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isConfirmPasswordValid,
    isFormValid,
  };
};
