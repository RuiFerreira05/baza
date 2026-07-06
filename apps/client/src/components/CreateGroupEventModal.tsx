import { useCreateEventStyles } from "@/constants/styles/useCreateEventStyles";
import { useAppMutation } from "@/hooks/useAppMutation";
import { useAppTheme } from "@/hooks/useAppTheme";
import { queryClient } from "@/lib/queryClient";
import { eventService } from "@/services/eventService";
import { CreateEventBody } from "@baza/shared-types";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import LabeledInput from "./LabeledInput";

interface CreateGroupEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
  initialDate: string; // YYYY-MM-DD
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

export default function CreateGroupEventModal({
  visible,
  onClose,
  onSuccess,
  groupId,
  initialDate,
}: CreateGroupEventModalProps) {
  const { colors, isDark } = useAppTheme();
  const formStyles = useCreateEventStyles();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>(() =>
    parseDateString(initialDate),
  );
  const [endDate, setEndDate] = useState<Date>(() =>
    parseDateString(initialDate),
  );

  // Set voting end date to yesterday or today
  const [votingEndDate, setVotingEndDate] = useState<Date>(() => {
    const d = parseDateString(initialDate);
    d.setDate(d.getDate() - 1); // default to 1 day before
    // If that is in the past compared to today, default to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d.getTime() < today.getTime()) {
      return today;
    }
    return d;
  });

  const [votingEndTime, setVotingEndTime] = useState<Date>(() => {
    const t = new Date();
    t.setHours(23, 59, 0, 0);
    return t;
  });

  const [isVotingDeadlineManuallyEdited, setIsVotingDeadlineManuallyEdited] =
    useState(false);

  const minStartDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const minVotingDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const maxVotingDate = useMemo(() => {
    const maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() - 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return maxDate < today ? today : maxDate;
  }, [startDate]);

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);

    // Auto-adjust end date if start date is after end date
    if (date > endDate) {
      setEndDate(date);
    }

    // Auto-calculate voting deadline if it hasn't been manually customized
    if (!isVotingDeadlineManuallyEdited) {
      const target = new Date(date);
      target.setDate(target.getDate() - 1);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (target.getTime() < today.getTime()) {
        setVotingEndDate(today);
      } else {
        setVotingEndDate(target);
      }
    }
  };

  // Pickers visibility states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showVotingEndDatePicker, setShowVotingEndDatePicker] = useState(false);
  const [showVotingEndTimePicker, setShowVotingEndTimePicker] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Date and time format helpers
  const formatDateLong = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const combineDateAndTime = (date: Date, time: Date): string => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined.toISOString();
  };

  // Mutation for creating the group event
  const createGroupEventMutation = useAppMutation({
    mutationFn: (body: CreateEventBody) =>
      eventService.createGroupEvent(groupId, body),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Planning window created successfully!",
        position: "bottom",
        bottomOffset: 80,
      });
      // Invalidate queries to refresh calendar and event lists
      queryClient.invalidateQueries({ queryKey: ["group-calendar", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] });
      onSuccess();
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.error.message || "Failed to create planning window.",
        position: "bottom",
        bottomOffset: 80,
      });
    },
  });

  const validateForm = () => {
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Event title is required.");
      return false;
    }
    if (title.length > 64) {
      setValidationError("Title must be 64 characters or less.");
      return false;
    }

    const startStr = formatDateToString(startDate);
    const endStr = formatDateToString(endDate);

    if (startStr > endStr) {
      setValidationError("Start date cannot be after end date.");
      return false;
    }

    // Check voting end date/time is earlier than start date
    const votingISO = combineDateAndTime(votingEndDate, votingEndTime);
    const votingTime = new Date(votingISO).getTime();

    // Start date at midnight
    const startMidnight = new Date(`${startStr}T00:00:00`).getTime();

    if (votingTime >= startMidnight) {
      setValidationError(
        "Voting deadline must be strictly earlier than the event start date.",
      );
      return false;
    }

    const now = new Date().getTime();
    if (votingTime <= now) {
      setValidationError("Voting deadline must be in the future.");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const body: CreateEventBody = {
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      startDate: formatDateToString(startDate),
      endDate: formatDateToString(endDate),
      votingEndTime: combineDateAndTime(votingEndDate, votingEndTime),
    };

    createGroupEventMutation.mutate(body);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={formStyles.modalContainer}>
        {/* Backdrop Dismiss trigger */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[formStyles.modalContent, { maxHeight: "90%" }]}>
          {/* Header */}
          <View style={formStyles.modalHeader}>
            <Text style={formStyles.modalTitle} numberOfLines={1}>
              Plan Group Event
            </Text>
            <Pressable
              style={formStyles.closeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={formStyles.formScroll}
          >
            {validationError && (
              <View
                style={{
                  backgroundColor: colors.error + "15",
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.error,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: colors.error,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  {validationError}
                </Text>
              </View>
            )}

            <LabeledInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Summer Beach Party"
              autoCapitalize="sentences"
            />

            <LabeledInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Add optional details..."
              autoCapitalize="sentences"
              isMultiLine={true}
            />

            {/* Event Start Date */}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Event Start Date</Text>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  themeVariant={isDark ? "dark" : "light"}
                  minimumDate={minStartDate}
                  onChange={(_, date) => {
                    if (date) handleStartDateChange(date);
                  }}
                />
              ) : (
                <>
                  <Pressable
                    style={formStyles.timePickerButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text style={formStyles.timePickerText}>
                      {formatDateLong(startDate)}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={colors.onSurfaceVariant}
                    />
                  </Pressable>
                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      minimumDate={minStartDate}
                      onChange={(_, date) => {
                        setShowStartPicker(false);
                        if (date) handleStartDateChange(date);
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {/* Event End Date */}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Event End Date</Text>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  themeVariant={isDark ? "dark" : "light"}
                  minimumDate={startDate}
                  onChange={(_, date) => {
                    if (date) setEndDate(date);
                  }}
                />
              ) : (
                <>
                  <Pressable
                    style={formStyles.timePickerButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Text style={formStyles.timePickerText}>
                      {formatDateLong(endDate)}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={colors.onSurfaceVariant}
                    />
                  </Pressable>
                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      minimumDate={startDate}
                      onChange={(_, date) => {
                        setShowEndPicker(false);
                        if (date) setEndDate(date);
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {/* Voting End Date */}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Voting Deadline Date</Text>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={votingEndDate}
                  mode="date"
                  themeVariant={isDark ? "dark" : "light"}
                  minimumDate={minVotingDate}
                  maximumDate={maxVotingDate}
                  onChange={(_, date) => {
                    if (date) {
                      setVotingEndDate(date);
                      setIsVotingDeadlineManuallyEdited(true);
                    }
                  }}
                />
              ) : (
                <>
                  <Pressable
                    style={formStyles.timePickerButton}
                    onPress={() => setShowVotingEndDatePicker(true)}
                  >
                    <Text style={formStyles.timePickerText}>
                      {formatDateLong(votingEndDate)}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={colors.onSurfaceVariant}
                    />
                  </Pressable>
                  {showVotingEndDatePicker && (
                    <DateTimePicker
                      value={votingEndDate}
                      mode="date"
                      minimumDate={minVotingDate}
                      maximumDate={maxVotingDate}
                      onChange={(_, date) => {
                        setShowVotingEndDatePicker(false);
                        if (date) {
                          setVotingEndDate(date);
                          setIsVotingDeadlineManuallyEdited(true);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {/* Voting End Time */}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Voting Deadline Time</Text>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={votingEndTime}
                  mode="time"
                  is24Hour={true}
                  themeVariant={isDark ? "dark" : "light"}
                  onChange={(_, date) => {
                    if (date) {
                      setVotingEndTime(date);
                      setIsVotingDeadlineManuallyEdited(true);
                    }
                  }}
                />
              ) : (
                <>
                  <Pressable
                    style={formStyles.timePickerButton}
                    onPress={() => setShowVotingEndTimePicker(true)}
                  >
                    <Text style={formStyles.timePickerText}>
                      {formatTime(votingEndTime)}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={colors.onSurfaceVariant}
                    />
                  </Pressable>
                  {showVotingEndTimePicker && (
                    <DateTimePicker
                      value={votingEndTime}
                      mode="time"
                      is24Hour={true}
                      onChange={(_, date) => {
                        setShowVotingEndTimePicker(false);
                        if (date) {
                          setVotingEndTime(date);
                          setIsVotingDeadlineManuallyEdited(true);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {/* Submit buttons */}
            <View style={formStyles.buttonRow}>
              <Pressable
                style={formStyles.cancelButton}
                onPress={onClose}
                disabled={createGroupEventMutation.isPending}
              >
                <Text style={formStyles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  formStyles.submitButton,
                  createGroupEventMutation.isPending &&
                    formStyles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={createGroupEventMutation.isPending}
              >
                {createGroupEventMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={formStyles.submitButtonText}>Create Plan</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
