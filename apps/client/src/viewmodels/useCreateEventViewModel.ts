import { useAppMutation } from "@/hooks/useAppMutation";
import { useAppQuery } from "@/hooks/useAppQuery";
import { useAuthState } from "@/hooks/useAuthState";
import { queryClient } from "@/lib/queryClient";
import { eventService } from "@/services/eventService";
import {
  CreatePersonalEventBody,
  EditPersonalEventBody,
  PersonalEventDTO,
} from "@baza/shared-types";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

interface UseCreateEventViewModelProps {
  initialDate: string; // YYYY-MM-DD format from the calendar selection
  onSuccess: () => void;
  eventToEdit?: PersonalEventDTO;
}

const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateToString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function useCreateEventViewModel({
  initialDate,
  onSuccess,
  eventToEdit,
}: UseCreateEventViewModelProps) {
  const { profile, bypassAuth } = useAuthState();
  const username = profile?.username || (bypassAuth ? "testuser" : "");

  // Form states
  const [eventDate, setEventDate] = useState<Date>(() =>
    eventToEdit
      ? parseDateString(eventToEdit.date)
      : parseDateString(initialDate),
  );
  const [prevInitialDate, setPrevInitialDate] = useState(initialDate);
  const [title, setTitle] = useState(eventToEdit ? eventToEdit.title : "");
  const [description, setDescription] = useState(
    eventToEdit?.description ?? "",
  );
  const [location, setLocation] = useState(eventToEdit?.location ?? "");

  // Sync eventDate when the calendar's selected day changes (React render-time adjustment)
  if (initialDate !== prevInitialDate) {
    setPrevInitialDate(initialDate);
    setEventDate(parseDateString(initialDate));
  }

  const getInitialTimes = () => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    // Add 1 hour if it's in the past to prevent past event presets
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end };
  };

  const initialTimes = getInitialTimes();
  const [startTime, setStartTime] = useState<Date>(() =>
    eventToEdit ? new Date(eventToEdit.startTime) : initialTimes.start,
  );
  const [endTime, setEndTime] = useState<Date>(() =>
    eventToEdit ? new Date(eventToEdit.endTime) : initialTimes.end,
  );
  const [repeat, setRepeat] = useState<
    "day" | "week" | "month" | "year" | "never"
  >(() => (eventToEdit ? (eventToEdit.repeat as any) : "never"));
  const [repeatUntil, setRepeatUntil] = useState<Date | null>(() =>
    eventToEdit?.repeatUntil ? parseDateString(eventToEdit.repeatUntil) : null,
  );
  const [isPublic, setIsPublic] = useState(
    eventToEdit ? eventToEdit.public : false,
  );
  const [allDay, setAllDay] = useState(
    eventToEdit ? !!eventToEdit.allDay : false,
  );

  // Picker visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showRepeatUntilPicker, setShowRepeatUntilPicker] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Query to fetch the master personal event if editing
  const baseEventQuery = useAppQuery({
    queryKey: ["personal-event", username, eventToEdit?.id],
    queryFn: () => eventService.getPersonalEvent(username, eventToEdit!.id),
    enabled: !!eventToEdit && !!username,
  });

  const baseEvent = baseEventQuery.data;

  // Sync state when master event details are fetched
  useEffect(() => {
    if (baseEvent) {
      setTitle(baseEvent.title);
      setDescription(baseEvent.description ?? "");
      setLocation(baseEvent.location ?? "");
      setEventDate(parseDateString(baseEvent.date));
      setStartTime(new Date(baseEvent.startTime));
      setEndTime(new Date(baseEvent.endTime));
      setRepeat(baseEvent.repeat as any);
      setRepeatUntil(
        baseEvent.repeatUntil ? parseDateString(baseEvent.repeatUntil) : null,
      );
      setIsPublic(baseEvent.public);
      setAllDay(!!baseEvent.allDay);
    }
  }, [baseEvent]);

  const isFetchingBase = baseEventQuery.isLoading && !!eventToEdit;

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
      setEventDate(parseDateString(initialDate));
      setTitle("");
      setDescription("");
      setLocation("");
      setIsPublic(false);
      setAllDay(false);
      setRepeat("never");
      setRepeatUntil(null);
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

  // Mutation for editing the personal event
  const editEventMutation = useAppMutation({
    mutationFn: (body: EditPersonalEventBody) =>
      eventService.editPersonalEvent(username, eventToEdit!.id, body),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Event updated successfully!",
        position: "bottom",
        bottomOffset: 80,
      });
      // Invalidate the cache to trigger calendar refetch
      queryClient.invalidateQueries({ queryKey: ["personal-events"] });
      // Invalidate single event detail query to prevent stale edit modals
      queryClient.invalidateQueries({
        queryKey: ["personal-event", username, eventToEdit!.id],
      });
      onSuccess();
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to update event.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
  });

  const combineDateAndTime = (date: Date, time: Date) => {
    const combined = new Date(date);
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

    // Verify startTime is earlier than endTime (only if not allDay)
    if (!allDay) {
      const startHour = startTime.getHours();
      const startMin = startTime.getMinutes();
      const endHour = endTime.getHours();
      const endMin = endTime.getMinutes();

      if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
        setValidationError("Start time must be earlier than end time.");
        return false;
      }
    }

    if (repeat !== "never" && repeatUntil) {
      const eventDateOnly = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate(),
      );
      const repeatUntilOnly = new Date(
        repeatUntil.getFullYear(),
        repeatUntil.getMonth(),
        repeatUntil.getDate(),
      );
      if (repeatUntilOnly < eventDateOnly) {
        setValidationError(
          "Repeat Until date cannot be before the event date.",
        );
        return false;
      }
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

    const dateStr = formatDateToString(eventDate);
    
    let startISO: string;
    let endISO: string;

    if (allDay) {
      const startObj = new Date(eventDate);
      startObj.setHours(0, 0, 0, 0);
      startISO = startObj.toISOString();

      const endObj = new Date(eventDate);
      endObj.setHours(23, 59, 59, 999);
      endISO = endObj.toISOString();
    } else {
      startISO = combineDateAndTime(eventDate, startTime);
      endISO = combineDateAndTime(eventDate, endTime);
    }

    const payload: CreatePersonalEventBody = {
      title: title.trim(),
      description: description.trim() || undefined,
      date: dateStr,
      location: location.trim() || undefined,
      startTime: startISO,
      endTime: endISO,
      allDay,
      repeat,
      repeatUntil:
        repeat !== "never" && repeatUntil
          ? formatDateToString(repeatUntil)
          : undefined,
      public: isPublic,
    };

    if (eventToEdit) {
      editEventMutation.mutate(payload);
    } else {
      createEventMutation.mutate(payload);
    }
  };

  return {
    eventDate,
    setEventDate,
    eventDateLabel: formatDateToString(eventDate),
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
    setRepeat: (val: "day" | "week" | "month" | "year" | "never") => {
      setRepeat(val);
      if (val === "never") setRepeatUntil(null);
    },
    repeatUntil,
    setRepeatUntil,
    isPublic,
    setIsPublic,
    allDay,
    setAllDay,
    showDatePicker,
    setShowDatePicker,
    showStartPicker,
    setShowStartPicker,
    showEndPicker,
    setShowEndPicker,
    showRepeatUntilPicker,
    setShowRepeatUntilPicker,
    validationError,
    setValidationError,
    handleCreateEvent,
    isFetchingBase,
    isLoading:
      createEventMutation.isPending ||
      editEventMutation.isPending ||
      isFetchingBase,
  };
}
