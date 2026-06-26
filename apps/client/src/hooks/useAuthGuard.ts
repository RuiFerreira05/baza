import { authClient } from "@/lib/auth";
import { userService } from "@/services/userService";
import { useAccountStore } from "@/store/useAccountStore";
import { ErrorTypes } from "@baza/shared-types";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAppQuery } from "./useAppQuery";

export function useAuthGuard() {
  const router = useRouter();
  const segments = useSegments();

  const bypassAuth = useAccountStore((state) => state.bypassAuth);
  const setProfile = useAccountStore((state) => state.setProfile);
  const setLoading = useAccountStore((state) => state.setLoading);
  const setError = useAccountStore((state) => state.setError);
  const clearAccount = useAccountStore((state) => state.clear);

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // 1. Fetch profile via useAppQuery (only if auth is active and not bypassed)
  const {
    data: profileData,
    isLoading: profileLoading,
    error: queryError,
  } = useAppQuery({
    queryKey: ["current-profile", session?.user?.id],
    queryFn: () => userService.getCurrentProfile(),
    enabled: !sessionLoading && !!session && !bypassAuth,
    retry: false,
  });

  // 2. Synchronize React Query state to the Zustand store
  useEffect(() => {
    if (bypassAuth) return;

    if (!session) {
      clearAccount();
      return;
    }

    const currentStore = useAccountStore.getState();
    const newProfile = profileData || null;
    const newLoading = profileLoading;
    const newError = queryError || null;

    if (
      currentStore.profile !== newProfile ||
      currentStore.loading !== newLoading ||
      currentStore.error !== newError
    ) {
      setProfile(newProfile);
      setLoading(newLoading);
      setError(newError);
    }
  }, [
    profileData,
    profileLoading,
    queryError,
    session,
    bypassAuth,
    clearAccount,
    setProfile,
    setLoading,
    setError,
  ]);

  // Determine if the auth state resolution is complete
  const isReady = bypassAuth || (!sessionLoading && !profileLoading);

  // 3. Routing Guard redirects
  useEffect(() => {
    if (!isReady) return;
    if (bypassAuth) return;

    const inProtectedGroup = segments[0] === "(protected)";
    const inAuthGroup = segments[0] === "auth";
    const isCreateProfileScreen = segments[1] === "createProfile";

    // Scenario A: No active session
    if (!session) {
      if (inProtectedGroup) {
        router.replace("/auth/login");
      }
      return;
    }

    // Scenario B: Authenticated but has no profile (redirect to pick username)
    const hasNoProfile =
      queryError?.error?.type === ErrorTypes.UnknownUsernameError;
    if (hasNoProfile) {
      if (!isCreateProfileScreen) {
        router.replace("/auth/createProfile");
      }
      return;
    }

    // Scenario C: Profile loaded successfully
    if (profileData) {
      if (inAuthGroup || isCreateProfileScreen) {
        router.replace("/(protected)/calendar");
      }
    }
  }, [session, profileData, queryError, isReady, segments, router, bypassAuth]);

  return { isReady };
}
