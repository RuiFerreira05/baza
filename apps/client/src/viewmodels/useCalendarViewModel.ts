import { useAppQuery } from "@/hooks/useAppQuery";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
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
    // Fallback if parsing fails
    return {
      startDate: "2026-06-01",
      endDate: "2026-08-31",
    };
  }
};

export function useCalendarViewModel() {
  const { colors } = useAppTheme();
  const { profile, bypassAuth } = useAuthState();

  // Selected date state (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Visible month range state (defaults to today's date to calculate current month range)
  const [visibleMonth, setVisibleMonth] = useState<string>(getTodayString());

  // Calculate dynamic date range for query
  const { startDate, endDate } = useMemo(() => {
    return getMonthDateRange(visibleMonth);
  }, [visibleMonth]);

  // Derive target username (authenticated profile or test bypass)
  const username = profile?.username || (bypassAuth ? "testuser" : "");

  // Query events using the dynamic window
  const eventsQuery = useAppQuery({
    queryKey: ["personal-events", username, startDate, endDate],
    queryFn: () =>
      eventService.getPersonalEvents(username, { startDate, endDate }),
    enabled: !!username,
  });

  const events = useMemo(() => {
    return eventsQuery.data ?? [];
  }, [eventsQuery.data]);

  // Filter events for the currently selected day
  const selectedDayEvents = useMemo(() => {
    return events.filter((event) => event.date === selectedDate);
  }, [events, selectedDate]);

  // Construct the marked dates dictionary for Wix Calendar
  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};

    // Add dots for days that have events
    events.forEach((event) => {
      const dateStr = event.date;
      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dotColor: colors.primary,
        };
      }
    });

    // Merge/Highlight selected date styling
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.onPrimary,
    };

    return marked;
  }, [events, selectedDate, colors]);

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const onMonthChange = (month: { dateString: string }) => {
    setVisibleMonth(month.dateString);
  };

  return {
    selectedDate,
    markedDates,
    selectedDayEvents,
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error
      ? `${eventsQuery.error.error.type}: ${eventsQuery.error.error.message}`
      : null,
    onDayPress,
    onMonthChange,
    refetchEvents: () => eventsQuery.refetch(),
  };
}
