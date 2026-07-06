import CreateGroupEventModal from "@/components/CreateGroupEventModal";
import GroupCalendarEventCard from "@/components/GroupCalendarEventCard";
import MemberEventCard from "@/components/MemberEventCard";
import { useCalendarStyles } from "@/constants/styles/useCalendarStyles";
import { useCreateEventStyles } from "@/constants/styles/useCreateEventStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGroupCalendarViewModel } from "@/viewmodels/useGroupCalendarViewModel";
import { GroupEventDTO, PersonalEventDTO } from "@baza/shared-types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
type ListItem =
  | { type: "group"; data: GroupEventDTO }
  | { type: "member"; data: PersonalEventDTO };

export default function GroupCalendarScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const calendarStyles = useCalendarStyles();
  const formStyles = useCreateEventStyles();
  const vm = useGroupCalendarViewModel();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isSelectedDateInPast = useMemo(() => {
    const todayStr = new Date().toISOString().substring(0, 10);
    return vm.selectedDate < todayStr;
  }, [vm.selectedDate]);

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

  // Combine group and member events for the flat list data
  const listData = useMemo((): ListItem[] => {
    const groupItems = vm.selectedDayGroupEvents.map(
      (evt): ListItem => ({ type: "group", data: evt }),
    );
    const memberItems = vm.selectedDayMemberEvents.map(
      (evt): ListItem => ({ type: "member", data: evt }),
    );
    return [...groupItems, ...memberItems];
  }, [vm.selectedDayGroupEvents, vm.selectedDayMemberEvents]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "group") {
      return (
        <GroupCalendarEventCard
          event={item.data}
          onPress={() => {
            router.push(
              `/(protected)/personal/groupSection/group/${vm.groupId}/event/${item.data.id}/details` as any,
            );
          }}
        />
      );
    } else {
      return <MemberEventCard event={item.data} />;
    }
  };

  return (
    <View style={calendarStyles.container}>
      {/* Calendar Grid Container */}
      <View style={calendarStyles.calendarContainer}>
        <Calendar
          key={isDark ? "dark-group-calendar" : "light-group-calendar"}
          current={vm.selectedDate}
          markedDates={vm.markedDates}
          onDayPress={vm.onDayPress}
          onMonthChange={vm.onMonthChange}
          theme={calendarTheme}
          enableSwipeMonths={true}
          firstDay={1}
          markingType="multi-dot"
        />
      </View>

      {/* Date Divider/Header */}
      <View style={calendarStyles.dividerRow}>
        <Text style={calendarStyles.dividerText}>
          {formatDateLabel(vm.selectedDate)}
        </Text>
        <View style={calendarStyles.line} />
      </View>

      {/* Event Lists */}
      {vm.isLoading && listData.length === 0 ? (
        <View style={calendarStyles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : vm.error ? (
        <View style={calendarStyles.errorContainer}>
          <Text style={{ color: colors.error }}>{vm.error}</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) =>
            item.type === "group"
              ? `group-${item.data.id}`
              : `member-${item.data.id}`
          }
          renderItem={renderItem}
          contentContainerStyle={calendarStyles.listContent}
          refreshing={vm.isLoading}
          onRefresh={vm.refetchCalendar}
          ListEmptyComponent={
            <View style={calendarStyles.emptyStateContainer}>
              <Ionicons
                name="calendar-clear-outline"
                size={48}
                color={colors.placeholder}
              />
              <Text style={calendarStyles.emptyStateTitle}>
                No group activity
              </Text>
              <Text style={calendarStyles.emptyStateSub}>
                There are no member events or group planning windows scheduled
                for this day.
              </Text>
            </View>
          }
        />
      )}

      {/* Plan Event FAB */}
      {!isSelectedDateInPast && (
        <Pressable
          style={({ pressed }) => [formStyles.fab, pressed && { opacity: 0.8 }]}
          onPress={() => setIsCreateModalOpen(true)}
        >
          <Ionicons name="add" size={30} color={colors.onPrimary} />
        </Pressable>
      )}

      {/* Group Event Creation Modal */}
      {isCreateModalOpen && (
        <CreateGroupEventModal
          visible={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            vm.refetchCalendar();
          }}
          groupId={vm.groupId}
          initialDate={vm.selectedDate}
        />
      )}
    </View>
  );
}
