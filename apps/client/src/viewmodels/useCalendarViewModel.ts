import { useState } from "react";
import { useRouter } from "expo-router";

export function useCalendarViewModel() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Handle data fetching, mutation triggers, and calculations here
  const navigateToGroups = () => router.push("/(protected)/groups");
  const navigateToProfile = () => router.push("/(protected)/profile");
  const signOut = () => router.replace("/auth/login");
  const changeDay = (add: number) =>
    setSelectedDate(
      (prevDate) => new Date(prevDate.getTime() + add * 24 * 60 * 60 * 1000),
    );

  return {
    selectedDate,
    setSelectedDate,
    navigateToGroups,
    navigateToProfile,
    signOut,
    changeDay,
  };
}
