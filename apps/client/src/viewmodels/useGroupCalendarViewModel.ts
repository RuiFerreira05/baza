import { useGroupInfo } from "@/hooks/useGroupInfo";
import { useAppQuery } from "@/hooks/useAppQuery";
import { useAppTheme } from "@/hooks/useAppTheme";
import { eventService } from "@/services/eventService";
import { useMemo, useState } from "react";

const getTodayString = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getMonthDateRange = (dateStr: string) => {
  try {
    const parts = dateStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month

    // First day of that month
    const firstDay = new Date(year, month, 1);
    // Last day of that month
    const lastDay = new Date(year, month + 1, 0);

    // Subtract 7 days from first day for overlap safety
    const startRange = new Date(firstDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Add 7 days to last day for overlap safety
    const endRange = new Date(lastDay.getTime() + 7 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    return {
      startDate: formatDate(startRange),
      endDate: formatDate(endRange),
    };
  } catch {
    return {
      startDate: "2026-06-01",
      endDate: "2026-08-31",
    };
  }
};

const getDatesInRange = (startStr: string, endStr: string): string[] => {
  const dates: string[] = [];
  try {
    const start = new Date(startStr + "T00:00:00");
    const end = new Date(endStr + "T00:00:00");
    const current = new Date(start);
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      const d = String(current.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }
  } catch {
    // ignore
  }
  return dates;
};

// Stable user colors helper
export const getUsernameColor = (username: string) => {
  const colorsList = [
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#EF4444", // Red
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorsList.length;
  return colorsList[index];
};

export function useGroupCalendarViewModel() {
  const { colors } = useAppTheme();
  const { groupId } = useGroupInfo();
  const isValidGroupId =
    groupId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      groupId,
    );

  // Selected date state (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Visible month range state
  const [visibleMonth, setVisibleMonth] = useState<string>(getTodayString());

  // Calculate dynamic date range for query
  const { startDate, endDate } = useMemo(() => {
    return getMonthDateRange(visibleMonth);
  }, [visibleMonth]);

  // Query combined calendar events
  const calendarQuery = useAppQuery({
    queryKey: ["group-calendar", groupId, startDate, endDate],
    queryFn: () =>
      eventService.getGroupCalendar(groupId!, { startDate, endDate }),
    enabled: !!isValidGroupId,
  });

  const groupEvents = useMemo(() => {
    return calendarQuery.data?.groupEvents ?? [];
  }, [calendarQuery.data?.groupEvents]);

  const memberEvents = useMemo(() => {
    return calendarQuery.data?.memberEvents ?? [];
  }, [calendarQuery.data?.memberEvents]);

  // Filter events for the currently selected day
  const selectedDayGroupEvents = useMemo(() => {
    return groupEvents.filter(
      (evt) => selectedDate >= evt.startDate && selectedDate <= evt.endDate,
    );
  }, [groupEvents, selectedDate]);

  const selectedDayMemberEvents = useMemo(() => {
    return memberEvents.filter((evt) => evt.date === selectedDate);
  }, [memberEvents, selectedDate]);

  // Construct the marked dates dictionary for Wix Calendar using multi-dot marking type
  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    // 1. Highlight Group Events spans (resolved = green background, unresolved = warning/amber background)
    groupEvents.forEach((evt) => {
      const datesInRange = getDatesInRange(evt.startDate, evt.endDate);
      const isResolved = evt.state === "finished";
      const highlightColor = isResolved
        ? colors.success + "25" // semi-transparent green
        : "#EAB30830"; // semi-transparent warning (amber)

      datesInRange.forEach((d) => {
        if (!marked[d]) {
          marked[d] = { dots: [] };
        }
        marked[d] = {
          ...marked[d],
          selected: true,
          selectedColor: highlightColor,
          selectedTextColor: colors.onSurface,
        };
      });
    });

    // 2. Add dots for member availability events
    memberEvents.forEach((evt) => {
      if (!marked[evt.date]) {
        marked[evt.date] = { dots: [] };
      }

      // Prevent multiple dots for the same user on the same date
      const dotKey = `${evt.username}-${evt.id}`;
      const exists = marked[evt.date].dots.some(
        (dot: any) => dot.key === dotKey,
      );
      if (!exists) {
        marked[evt.date].dots.push({
          key: dotKey,
          color: getUsernameColor(evt.username),
        });
      }
    });

    // 3. Overwrite current selected date highlight (ensure it stands out)
    if (!marked[selectedDate]) {
      marked[selectedDate] = { dots: [] };
    }
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.onPrimary,
    };

    return marked;
  }, [groupEvents, memberEvents, selectedDate, colors]);

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month: { dateString: string }) => {
    setVisibleMonth(month.dateString);
  };

  return {
    groupId: groupId!,
    selectedDate,
    markedDates,
    selectedDayGroupEvents,
    selectedDayMemberEvents,
    isLoading: calendarQuery.isLoading,
    error: calendarQuery.error
      ? `${calendarQuery.error.error.type}: ${calendarQuery.error.error.message}`
      : null,
    onDayPress,
    onMonthChange,
    refetchCalendar: () => calendarQuery.refetch(),
  };
}
