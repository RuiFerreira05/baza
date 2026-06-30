import { useAppMutation } from "@/hooks/useAppMutation";
import { useAuthState } from "@/hooks/useAuthState";
import { queryClient } from "@/lib/queryClient";
import { eventService } from "@/services/eventService";
import { CreatePersonalEventBody } from "@baza/shared-types";
import { useState } from "react";
import Toast from "react-native-toast-message";

interface UseCreateEventViewModelProps {
  selectedDate: string; // YYYY-MM-DD format
  onSuccess: () => void;
}

export function useCreateEventViewModel({
  selectedDate,
  onSuccess,
}: UseCreateEventViewModelProps) {
  const { profile, bypassAuth } = useAuthState();
  const username = profile?.username || (bypassAuth ? "testuser" : "");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const getInitialTimes = () => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    // Add 1 hour if it's in the past to prevent past event presets
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end };
  };

  const initialTimes = getInitialTimes();
  const [startTime, setStartTime] = useState<Date>(initialTimes.start);
  const [endTime, setEndTime] = useState<Date>(initialTimes.end);
  const [repeat, setRepeat] = useState<
    "day" | "week" | "month" | "year" | "never"
  >("never");
  const [isPublic, setIsPublic] = useState(false);

  // Picker visibility states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Mutation for creating the personal event
  const createEventMutation = useAppMutation({
    mutationFn: (body: CreatePersonalEventBody) =>
      eventService.createPersonalEvent(username, body),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Event created successfully!",
        position: "bottom",
        bottomOffset: 80,
      });
      // Invalidate the cache to trigger calendar refetch
      queryClient.invalidateQueries({ queryKey: ["personal-events"] });
      // Reset form states
      setTitle("");
      setDescription("");
      setLocation("");
      setIsPublic(false);
      setRepeat("never");
      onSuccess();
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to create event.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
  });

  const combineDateAndTime = (dateStr: string, time: Date) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const combined = new Date(year, month - 1, day);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined.toISOString();
  };

  const validateForm = () => {
    if (!title.trim()) {
      setValidationError("Event title is required.");
      return false;
    }
    if (title.length > 64) {
      setValidationError("Title must be 64 characters or less.");
      return false;
    }

    // Verify startTime is earlier than endTime
    const startHour = startTime.getHours();
    const startMin = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMin = endTime.getMinutes();

    if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
      setValidationError("Start time must be earlier than end time.");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleCreateEvent = () => {
    if (!validateForm()) return;
    if (!username) {
      setValidationError("User session not found.");
      return;
    }

    const startISO = combineDateAndTime(selectedDate, startTime);
    const endISO = combineDateAndTime(selectedDate, endTime);

    const payload: CreatePersonalEventBody = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: selectedDate,
      location: location.trim() || undefined,
      startTime: startISO,
      endTime: endISO,
      repeat,
      public: isPublic,
    };

    createEventMutation.mutate(payload);
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    location,
    setLocation,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    repeat,
    setRepeat,
    isPublic,
    setIsPublic,
    showStartPicker,
    setShowStartPicker,
    showEndPicker,
    setShowEndPicker,
    validationError,
    setValidationError,
    handleCreateEvent,
    isLoading: createEventMutation.isPending,
  };
}
