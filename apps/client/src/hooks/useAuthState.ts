import { authClient } from "@/lib/auth";
import { env } from "@/lib/env";
import { errorReporter } from "@/lib/errorReporter";
import { userService } from "@/services/userService";
import { ErrorTypes } from "@baza/shared-types";
import { useAppQuery } from "./useAppQuery";

export function useAuthState() {
  // 1. Determine bypass directly from environment variables
  const bypassAuth = __DEV__ && env.EXPO_PUBLIC_BYPASS_AUTH === "true";

  // 2. Fetch base auth session
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // 3. Fetch extended profile (only if auth is active and not bypassed)
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

  // 4. Derive boolean flags
  const isLoading =
    !bypassAuth && (sessionLoading || (!!session && profileLoading));
  const hasNoProfile =
    queryError?.error?.type === ErrorTypes.UnknownUsernameError;

  if (!hasNoProfile) {
    errorReporter.logMessage(
      `useAuthState: profile successfully fetched for user: ${session?.user?.name}` +
        `\nprofile: ${JSON.stringify(profileData)}`,
      "info",
    );
  }

  return {
    session,
    profile: profileData,
    isLoading,
    hasNoProfile,
    bypassAuth,
  };
}
