import { useRouter } from "expo-router";

export function useProfileViewModel(profileId: string) {
  const router = useRouter();

  const navigateToGroups = () => router.push("/(protected)/groups");
  const navigateToFriends = () => router.push("/(protected)/friends");
  const navigateToCalendar = () => router.push("/(protected)/calendar");

  return {
    navigateToGroups,
    navigateToFriends,
    navigateToCalendar,
  };
}
