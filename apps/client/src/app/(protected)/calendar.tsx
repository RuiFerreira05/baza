import EventCard from "@/components/EventCard";
import LabeledInput from "@/components/LabeledInput";
import { useCalendarStyles } from "@/constants/styles/useCalendarStyles";
import { useCreateEventStyles } from "@/constants/styles/useCreateEventStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCalendarViewModel } from "@/viewmodels/useCalendarViewModel";
import { useCreateEventViewModel } from "@/viewmodels/useCreateEventViewModel";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalendarScreen() {
  const { colors, isDark } = useAppTheme();
  const calendarStyles = useCalendarStyles();
  const formStyles = useCreateEventStyles();
  const vm = useCalendarViewModel();

  // State to control modal visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Initialize event creation ViewModel
  const formVm = useCreateEventViewModel({
    initialDate: vm.selectedDate,
    onSuccess: () => {
      setIsCreateModalOpen(false);
      vm.refetchEvents(); // Refresh schedule view
    },
  });

  // Map app theme colors to Wix Calendar styles dynamically
  const calendarTheme = useMemo(() => {
    return {
      backgroundColor: colors.background,
      calendarBackground: colors.background,
      textSectionTitleColor: colors.onSurfaceVariant,
      selectedDayBackgroundColor: colors.primary,
      selectedDayTextColor: colors.onPrimary,
      todayTextColor: colors.primary,
      dayTextColor: colors.onSurface,
      textDisabledColor: colors.disabled,
      dotColor: colors.primary,
      selectedDotColor: colors.onPrimary,
      disabledDotColor: colors.disabled,
      monthTextColor: colors.onSurface,
      indicatorColor: colors.primary,
      textMonthFontFamily: "Inter_600SemiBold",
      textDayFontFamily: "Inter_400Regular",
      textDayHeaderFontFamily: "Inter_500Medium",
      textDayFontSize: 14,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 12,
      arrowColor: colors.primary,
    };
  }, [colors]);

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

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
    <SafeAreaView style={calendarStyles.container} edges={["top"]}>
      {/* Page Header */}
      <View style={calendarStyles.headerContainer}>
        <Text style={calendarStyles.headerTitle}>My Schedule</Text>
      </View>

      {/* Calendar Grid Container */}
      <View style={calendarStyles.calendarContainer}>
        <Calendar
          key={isDark ? "dark-calendar" : "light-calendar"}
          current={vm.selectedDate}
          markedDates={vm.markedDates}
          onDayPress={vm.onDayPress}
          onDayLongPress={(day: { dateString: string }) => {
            vm.onDayPress(day);
            setIsCreateModalOpen(true);
          }}
          onMonthChange={vm.onMonthChange}
          theme={calendarTheme}
          enableSwipeMonths={true}
        />
      </View>

      {/* Date Divider/Header for the schedule list */}
      <View style={calendarStyles.dividerRow}>
        <Text style={calendarStyles.dividerText}>
          {formatDateLabel(vm.selectedDate)}
        </Text>
        <View style={calendarStyles.line} />
      </View>

      {/* Events List */}
      {vm.isLoading ? (
        <View style={calendarStyles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : vm.error ? (
        <View style={calendarStyles.errorContainer}>
          <Text style={{ color: colors.error }}>{vm.error}</Text>
        </View>
      ) : (
        <FlatList
          data={vm.selectedDayEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              title={item.title}
              description={item.description}
              startTime={item.startTime}
              endTime={item.endTime}
              location={item.location}
              repeat={item.repeat}
              isPublic={item.public}
            />
          )}
          contentContainerStyle={calendarStyles.listContent}
          ListEmptyComponent={
            <View style={calendarStyles.emptyStateContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={colors.placeholder}
              />
              <Text style={calendarStyles.emptyStateTitle}>
                No events scheduled
              </Text>
              <Text style={calendarStyles.emptyStateSub}>
                Tap the Floating Action Button or pick another date to add an
                event.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <Pressable
        style={({ pressed }) => [formStyles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => setIsCreateModalOpen(true)}
      >
        <Ionicons name="add" size={30} color={colors.onPrimary} />
      </Pressable>

      {/* Event Creation Bottom Sheet Modal */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={formStyles.modalContainer}>
          {/* Backdrop Dismiss trigger */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsCreateModalOpen(false)}
          />

          <View style={formStyles.modalContent}>
            {/* Sheet Header */}
            <View style={formStyles.modalHeader}>
              <Text style={formStyles.modalTitle} numberOfLines={1}>
                Schedule Event
              </Text>
              <Pressable
                style={formStyles.closeButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={() => setIsCreateModalOpen(false)}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
              </Pressable>
            </View>

            {/* Scrollable Form Body */}
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

              {/* Event Start & End Time selectors (Platform specific picker patterns) */}
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
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <DateTimePicker
                          value={formVm.repeatUntil || formVm.eventDate}
                          mode="date"
                          themeVariant={isDark ? "dark" : "light"}
                          onChange={(_, date) => {
                            if (date) formVm.setRepeatUntil(date);
                          }}
                        />
                        {formVm.repeatUntil && (
                          <Pressable onPress={() => formVm.setRepeatUntil(null)} style={{ marginLeft: 8 }}>
                            <Ionicons name="close-circle" size={20} color={colors.onSurfaceVariant} />
                          </Pressable>
                        )}
                      </View>
                    ) : (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Pressable
                          style={[formStyles.timePickerButton, { flex: 1 }]}
                          onPress={() => formVm.setShowRepeatUntilPicker(true)}
                        >
                          <Text style={formStyles.timePickerText}>
                            {formVm.repeatUntil ? formatDateLong(formVm.repeatUntil) : "Forever"}
                          </Text>
                          <Ionicons
                            name="calendar-outline"
                            size={18}
                            color={colors.onSurfaceVariant}
                          />
                        </Pressable>
                        {formVm.repeatUntil && (
                          <Pressable onPress={() => formVm.setRepeatUntil(null)} style={{ marginLeft: 8 }}>
                            <Ionicons name="close-circle" size={24} color={colors.onSurfaceVariant} />
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
                <Pressable
                  style={formStyles.cancelButton}
                  onPress={() => setIsCreateModalOpen(false)}
                >
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
                    <Text style={formStyles.submitButtonText}>Save Event</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
