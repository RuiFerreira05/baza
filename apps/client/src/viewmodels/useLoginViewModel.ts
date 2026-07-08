import { authClient } from "@/lib/auth";
import { env } from "@/lib/env";
import { useState } from "react";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

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

  const onGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const webClientId = env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

      // 1. If Web Client ID is present, attempt Native Google Sign-in
      if (webClientId) {
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
        setError(
          authError.message || "An error occurred during Google sign-in.",
        );
      }
    } catch (err: any) {
      try {
        const { error: authError } = await authClient.signIn.social({
          provider: "google",
          callbackURL: "baza://",
        });
        if (authError) {
          setError(
            authError.message ||
              "An error occurred during fallback Google sign-in.",
          );
        }
      } catch (fallbackErr: any) {
        setError(err.message || "Google sign-in failed.");
      }
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
    onGoogleSignIn,
    isIdentifierValid,
    isPasswordValid,
    isFormValid,
  };
};
