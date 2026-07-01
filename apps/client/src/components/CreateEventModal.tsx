import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
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

import { PersonalEventDTO } from "@baza/shared-types";
import LabeledInput from "@/components/LabeledInput";
import { useCreateEventStyles } from "@/constants/styles/useCreateEventStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCreateEventViewModel } from "@/viewmodels/useCreateEventViewModel";

type CreateEventModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate: string;
  eventToEdit?: PersonalEventDTO;
};

export default function CreateEventModal({
  visible,
  onClose,
  onSuccess,
  initialDate,
  eventToEdit,
}: CreateEventModalProps) {
  const { colors, isDark } = useAppTheme();
  const formStyles = useCreateEventStyles();

  const formVm = useCreateEventViewModel({
    initialDate,
    onSuccess,
    eventToEdit,
  });

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

  const repeatOptions = ["never", "day", "week", "month", "year"] as const;

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

        <View style={formStyles.modalContent}>
          {/* Sheet Header */}
          <View style={formStyles.modalHeader}>
            <Text style={formStyles.modalTitle} numberOfLines={1}>
              {eventToEdit ? "Edit Event" : "Schedule Event"}
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

          {/* Scrollable Form Body */}
          {formVm.isFetchingBase ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 12, color: colors.onSurfaceVariant, fontFamily: "Inter_500Medium" }}>
                Loading event details...
              </Text>
            </View>
          ) : (
            <ScrollView
            contentContainerStyle={formStyles.formScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Event Title */}
            <LabeledInput
              label="Event Title *"
              value={formVm.title}
              onChangeText={formVm.setTitle}
              placeholder="e.g. Weekly Standup"
              autoCapitalize="sentences"
              isCorrect={formVm.title.trim().length > 0}
            />

            {/* Event Location */}
            <LabeledInput
              label="Location"
              value={formVm.location}
              onChangeText={formVm.setLocation}
              placeholder="e.g. Conference Room B or Zoom link"
              autoCapitalize="sentences"
            />

            {/* Event Description */}
            <LabeledInput
              label="Description"
              value={formVm.description}
              onChangeText={formVm.setDescription}
              placeholder="Add optional notes..."
              autoCapitalize="sentences"
            />

            {/* Event Date selector */}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.label}>Date</Text>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={formVm.eventDate}
                  mode="date"
                  themeVariant={isDark ? "dark" : "light"}
                  onChange={(_, date) => {
                    if (date) formVm.setEventDate(date);
                  }}
                />
              ) : (
                <>
                  <Pressable
                    style={formStyles.timePickerButton}
                    onPress={() => formVm.setShowDatePicker(true)}
                  >
                    <Text style={formStyles.timePickerText}>
                      {formatDateLong(formVm.eventDate)}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={colors.onSurfaceVariant}
                    />
                  </Pressable>
                  {formVm.showDatePicker && (
                    <DateTimePicker
                      value={formVm.eventDate}
                      mode="date"
                      onChange={(_, date) => {
                        formVm.setShowDatePicker(false);
                        if (date) formVm.setEventDate(date);
                      }}
                    />
                  )}
                </>
              )}
            </View>

            {/* All-day Event switch toggle */}
            <View style={formStyles.switchRow}>
              <View style={formStyles.switchLabelContainer}>
                <Text style={formStyles.switchLabel}>All-day Event</Text>
                <Text style={formStyles.switchSub}>
                  Set this event to run for the entire day
                </Text>
              </View>
              <Switch
                value={formVm.allDay}
                onValueChange={formVm.setAllDay}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  formVm.allDay ? colors.onPrimary : colors.onSurfaceVariant
                }
              />
            </View>

            {/* Event Start & End Time selectors (Platform specific picker patterns) */}
            {!formVm.allDay && (
              <View style={formStyles.timeRow}>
                {/* Start Time Field */}
                <View style={formStyles.inputGroup}>
                  <Text style={formStyles.label}>Start Time</Text>
                  {Platform.OS === "ios" ? (
                    <DateTimePicker
                      value={formVm.startTime}
                      mode="time"
                      is24Hour={true}
                      themeVariant={isDark ? "dark" : "light"}
                      onChange={(_, date) => {
                        if (date) formVm.setStartTime(date);
                      }}
                    />
                  ) : (
                    <>
                      <Pressable
                        style={formStyles.timePickerButton}
                        onPress={() => formVm.setShowStartPicker(true)}
                      >
                        <Text style={formStyles.timePickerText}>
                          {formatTime(formVm.startTime)}
                        </Text>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={colors.onSurfaceVariant}
                        />
                      </Pressable>
                      {formVm.showStartPicker && (
                        <DateTimePicker
                          value={formVm.startTime}
                          mode="time"
                          is24Hour={true}
                          onChange={(_, date) => {
                            formVm.setShowStartPicker(false);
                            if (date) formVm.setStartTime(date);
                          }}
                        />
                      )}
                    </>
                  )}
                </View>

                {/* End Time Field */}
                <View style={formStyles.inputGroup}>
                  <Text style={formStyles.label}>End Time</Text>
                  {Platform.OS === "ios" ? (
                    <DateTimePicker
                      value={formVm.endTime}
                      mode="time"
                      is24Hour={true}
                      themeVariant={isDark ? "dark" : "light"}
                      onChange={(_, date) => {
                        if (date) formVm.setEndTime(date);
                      }}
                    />
                  ) : (
                    <>
                      <Pressable
                        style={formStyles.timePickerButton}
                        onPress={() => formVm.setShowEndPicker(true)}
                      >
                        <Text style={formStyles.timePickerText}>
                          {formatTime(formVm.endTime)}
                        </Text>
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color={colors.onSurfaceVariant}
                        />
                      </Pressable>
                      {formVm.showEndPicker && (
                        <DateTimePicker
                          value={formVm.endTime}
                          mode="time"
                          is24Hour={true}
                          onChange={(_, date) => {
                            formVm.setShowEndPicker(false);
                            if (date) formVm.setEndTime(date);
                          }}
                        />
                      )}
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Repeat rules selector capsules */}
            <View style={formStyles.inputGroup}>
              <Text style={formStyles.repeatLabel}>Repeat Schedule</Text>
              <View style={formStyles.repeatRow}>
                {repeatOptions.map((opt) => {
                  const isActive = formVm.repeat === opt;
                  return (
                    <Pressable
                      key={opt}
                      style={[
                        formStyles.repeatCapsule,
                        isActive && formStyles.repeatCapsuleActive,
                      ]}
                      onPress={() => formVm.setRepeat(opt)}
                    >
                      <Text
                        style={[
                          formStyles.repeatText,
                          isActive && formStyles.repeatTextActive,
                        ]}
                      >
                        {opt.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {formVm.repeat !== "never" && (
                <View style={[formStyles.inputGroup, { marginTop: 16 }]}>
                  <Text style={formStyles.label}>Repeat Until (Optional)</Text>
                  {Platform.OS === "ios" ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <DateTimePicker
                        value={formVm.repeatUntil || formVm.eventDate}
                        mode="date"
                        themeVariant={isDark ? "dark" : "light"}
                        onChange={(_, date) => {
                          if (date) formVm.setRepeatUntil(date);
                        }}
                      />
                      {formVm.repeatUntil && (
                        <Pressable
                          onPress={() => formVm.setRepeatUntil(null)}
                          style={{ marginLeft: 8 }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color={colors.onSurfaceVariant}
                          />
                        </Pressable>
                      )}
                    </View>
                  ) : (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Pressable
                        style={[formStyles.timePickerButton, { flex: 1 }]}
                        onPress={() => formVm.setShowRepeatUntilPicker(true)}
                      >
                        <Text style={formStyles.timePickerText}>
                          {formVm.repeatUntil
                            ? formatDateLong(formVm.repeatUntil)
                            : "Forever"}
                        </Text>
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={colors.onSurfaceVariant}
                        />
                      </Pressable>
                      {formVm.repeatUntil && (
                        <Pressable
                          onPress={() => formVm.setRepeatUntil(null)}
                          style={{ marginLeft: 8 }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={colors.onSurfaceVariant}
                          />
                        </Pressable>
                      )}
                      {formVm.showRepeatUntilPicker && (
                        <DateTimePicker
                          value={formVm.repeatUntil || formVm.eventDate}
                          mode="date"
                          onChange={(_, date) => {
                            formVm.setShowRepeatUntilPicker(false);
                            if (date) formVm.setRepeatUntil(date);
                          }}
                        />
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Public/Private switch toggle row */}
            <View style={formStyles.switchRow}>
              <View style={formStyles.switchLabelContainer}>
                <Text style={formStyles.switchLabel}>Public Event</Text>
                <Text style={formStyles.switchSub}>
                  Allow friends to see details of this event
                </Text>
              </View>
              <Switch
                value={formVm.isPublic}
                onValueChange={formVm.setIsPublic}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  formVm.isPublic ? colors.onPrimary : colors.onSurfaceVariant
                }
              />
            </View>

            {/* Validation Warning Alert */}
            {formVm.validationError && (
              <Text
                style={{
                  color: colors.error,
                  fontSize: 13,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {formVm.validationError}
              </Text>
            )}

            {/* Modal action Buttons row */}
            <View style={formStyles.buttonRow}>
              <Pressable style={formStyles.cancelButton} onPress={onClose}>
                <Text style={formStyles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  formStyles.submitButton,
                  formVm.isLoading && formStyles.disabledButton,
                ]}
                disabled={formVm.isLoading}
                onPress={formVm.handleCreateEvent}
              >
                {formVm.isLoading ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={formStyles.submitButtonText}>
                    {eventToEdit ? "Save Changes" : "Save Event"}
                  </Text>
                )}
              </Pressable>
            </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
