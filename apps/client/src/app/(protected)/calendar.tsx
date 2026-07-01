import EventCard from "@/components/EventCard";
import CreateEventModal from "@/components/CreateEventModal";
import { useCalendarStyles } from "@/constants/styles/useCalendarStyles";
import { useCreateEventStyles } from "@/constants/styles/useCreateEventStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCalendarViewModel } from "@/viewmodels/useCalendarViewModel";
import { Ionicons } from "@expo/vector-icons";
import { PersonalEventDTO } from "@baza/shared-types";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<
    PersonalEventDTO | undefined
  >(undefined);

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
            setSelectedEventForEdit(undefined);
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
              allDay={item.allDay}
              location={item.location}
              repeat={item.repeat}
              isPublic={item.public}
              onPress={() => {
                setSelectedEventForEdit(item);
                setIsCreateModalOpen(true);
              }}
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
        onPress={() => {
          setSelectedEventForEdit(undefined);
          setIsCreateModalOpen(true);
        }}
      >
        <Ionicons name="add" size={30} color={colors.onPrimary} />
      </Pressable>

      {/* Event Creation Bottom Sheet Modal */}
      {isCreateModalOpen && (
        <CreateEventModal
          visible={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedEventForEdit(undefined);
          }}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            setSelectedEventForEdit(undefined);
            vm.refetchEvents();
          }}
          initialDate={vm.selectedDate}
          eventToEdit={selectedEventForEdit}
        />
      )}
    </SafeAreaView>
  );
}
