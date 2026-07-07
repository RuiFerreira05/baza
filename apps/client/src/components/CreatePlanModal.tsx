import { useCreateEventStyles } from "@/constants/styles/useCreateEventStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { CreatePlanBody, GroupEventDTO } from "@baza/shared-types";
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
  Switch,
  Text,
  View,
} from "react-native";
import GooglePlacesMapInput from "./GooglePlacesMapInput";
import LabeledInput from "./LabeledInput";

interface CreatePlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (body: CreatePlanBody) => Promise<any>;
  isSubmitting: boolean;
  eventDetails: GroupEventDTO;
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

export default function CreatePlanModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  eventDetails,
}: CreatePlanModalProps) {
  const { colors, isDark } = useAppTheme();
  const formStyles = useCreateEventStyles();

  const minDate = useMemo(
    () => parseDateString(eventDetails.startDate),
    [eventDetails.startDate],
  );
  const maxDate = useMemo(
    () => parseDateString(eventDetails.endDate),
    [eventDetails.endDate],
  );

  // Form states
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [activity, setActivity] = useState("");
  const [planDate, setPlanDate] = useState<Date>(minDate);
  const [allDay, setAllDay] = useState(false);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [startTime, setStartTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    return d;
  });

  // Pickers visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Formatting helpers
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

  const formatTimeToString = (time: Date): string => {
    const hrs = String(time.getHours()).padStart(2, "0");
    const mins = String(time.getMinutes()).padStart(2, "0");
    return `${hrs}:${mins}:00Z`;
  };

  const validateForm = () => {
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Plan title is required.");
      return false;
    }
    if (title.length > 64) {
      setValidationError("Title must be 64 characters or less.");
      return false;
    }
    if (!location.trim()) {
      setValidationError("Plan location is required.");
      return false;
    }

    if (!allDay) {
      const startVal = formatTimeToString(startTime);
      const endVal = formatTimeToString(endTime);
      if (startVal >= endVal) {
        setValidationError(
          "Start time must be strictly earlier than end time.",
        );
        return false;
      }
    }

    const minB = minBudget.trim() ? parseInt(minBudget, 10) : null;
    const maxB = maxBudget.trim() ? parseInt(maxBudget, 10) : null;

    if (minB !== null && isNaN(minB)) {
      setValidationError("Min budget must be a valid number.");
      return false;
    }
    if (maxB !== null && isNaN(maxB)) {
      setValidationError("Max budget must be a valid number.");
      return false;
    }
    if (minB !== null && maxB !== null && minB >= maxB) {
      setValidationError("Min budget must be less than max budget.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const minB = minBudget.trim() ? parseInt(minBudget, 10) : undefined;
    const maxB = maxBudget.trim() ? parseInt(maxBudget, 10) : undefined;

    const body: CreatePlanBody = {
      title: title.trim(),
      date: formatDateToString(planDate),
      allDay,
      location: location.trim(),
      activity: activity.trim() ? activity.trim() : undefined,
      minBudget: minB ?? undefined,
      maxBudget: maxB ?? undefined,
      startTime: allDay ? undefined : formatTimeToString(startTime),
      endTime: allDay ? undefined : formatTimeToString(endTime),
    };

    try {
      await onSubmit(body);
      // Reset form
      setTitle("");
      setLocation("");
      setActivity("");
      setPlanDate(minDate);
      setAllDay(false);
      setMinBudget("");
      setMaxBudget("");
      onClose();
    } catch {
      // toast is shown in viewmodel mutation
    }
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
              Propose New Plan
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
            scrollEnabled={scrollEnabled}
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
              label="Title *"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Picnic in the park"
              autoCapitalize="sentences"
            />

            <GooglePlacesMapInput
              label="Location *"
              value={location}
              onChangeText={setLocation}
              onMapInteraction={(active) => setScrollEnabled(!active)}
            />

            <LabeledInput
              label="Activity Details"
              value={activity}
              onChangeText={setActivity}
              placeholder="e.g. Bring some food and drinks..."
              autoCapitalize="sentences"
              isMultiLine={true}
            />

            {/* Date Selection */}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Date *</Text>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={planDate}
                  mode="date"
                  themeVariant={isDark ? "dark" : "light"}
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  onChange={(_, date) => {
                    if (date) setPlanDate(date);
                  }}
                />
              ) : (
                <>
                  <Pressable
                    style={formStyles.timePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={formStyles.timePickerText}>
                      {formatDateLong(planDate)}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={colors.onSurfaceVariant}
                    />
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      value={planDate}
                      mode="date"
                      minimumDate={minDate}
                      maximumDate={maxDate}
                      onChange={(_, date) => {
                        setShowDatePicker(false);
                        if (date) setPlanDate(date);
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {/* All Day Toggle */}
            <View style={formStyles.switchRow}>
              <View style={formStyles.switchLabelContainer}>
                <Text
                  style={[formStyles.switchLabel, { color: colors.onSurface }]}
                >
                  All-Day Event
                </Text>
                <Text style={formStyles.switchSub}>
                  Covers the entire day (00:00 - 23:59)
                </Text>
              </View>
              <Switch
                value={allDay}
                onValueChange={setAllDay}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  Platform.OS === "android" ? colors.surface : undefined
                }
              />
            </View>

            {/* Start and End Times */}
            {!allDay && (
              <View style={formStyles.timeRow}>
                <View style={[formStyles.inputGroup, { flex: 1 }]}>
                  <Text style={formStyles.label}>Start Time</Text>
                  {Platform.OS === "ios" ? (
                    <DateTimePicker
                      value={startTime}
                      mode="time"
                      themeVariant={isDark ? "dark" : "light"}
                      onChange={(_, date) => {
                        if (date) setStartTime(date);
                      }}
                    />
                  ) : (
                    <>
                      <Pressable
                        style={formStyles.timePickerButton}
                        onPress={() => setShowStartTimePicker(true)}
                      >
                        <Text style={formStyles.timePickerText}>
                          {formatTime(startTime)}
                        </Text>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={colors.onSurfaceVariant}
                        />
                      </Pressable>
                      {showStartTimePicker && (
                        <DateTimePicker
                          value={startTime}
                          mode="time"
                          is24Hour={true}
                          onChange={(_, date) => {
                            setShowStartTimePicker(false);
                            if (date) setStartTime(date);
                          }}
                        />
                      )}
                    </>
                  )}
                </View>

                <View style={[formStyles.inputGroup, { flex: 1 }]}>
                  <Text style={formStyles.label}>End Time</Text>
                  {Platform.OS === "ios" ? (
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      themeVariant={isDark ? "dark" : "light"}
                      onChange={(_, date) => {
                        if (date) setEndTime(date);
                      }}
                    />
                  ) : (
                    <>
                      <Pressable
                        style={formStyles.timePickerButton}
                        onPress={() => setShowEndTimePicker(true)}
                      >
                        <Text style={formStyles.timePickerText}>
                          {formatTime(endTime)}
                        </Text>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={colors.onSurfaceVariant}
                        />
                      </Pressable>
                      {showEndTimePicker && (
                        <DateTimePicker
                          value={endTime}
                          mode="time"
                          is24Hour={true}
                          onChange={(_, date) => {
                            setShowEndTimePicker(false);
                            if (date) setEndTime(date);
                          }}
                        />
                      )}
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Budgets */}
            <View style={formStyles.timeRow}>
              <View style={{ flex: 1 }}>
                <LabeledInput
                  label="Min Budget (€)"
                  value={minBudget}
                  onChangeText={setMinBudget}
                  placeholder="e.g. 10"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <LabeledInput
                  label="Max Budget (€)"
                  value={maxBudget}
                  onChangeText={setMaxBudget}
                  placeholder="e.g. 50"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Actions */}
            <View style={formStyles.buttonRow}>
              <Pressable
                style={formStyles.cancelButton}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={formStyles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  formStyles.submitButton,
                  isSubmitting && formStyles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={formStyles.submitButtonText}>Submit Plan</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
