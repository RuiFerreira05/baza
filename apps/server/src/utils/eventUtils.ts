export function expandRepeatingEvents<
  T extends {
    date: string;
    startTime: string;
    endTime: string;
    repeat: string;
  },
>(event: T, startDateStr: string, endDateStr: string): T[] {
  if (event.repeat === "never") {
    // For non-repeating events, if we fetched it, it means it already matches the date window
    // based on our Drizzle query logic. Just return it.
    return [event];
  }

  const occurrences: T[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const eventDate = new Date(event.date);

  const current = new Date(eventDate);
  let sanityCheck = 0; // Prevent infinite loops just in case

  while (current <= end && sanityCheck < 1000) {
    if (current >= start) {
      const diffMs = current.getTime() - eventDate.getTime();
      const newStartTime = new Date(
        new Date(event.startTime).getTime() + diffMs,
      );
      const newEndTime = new Date(new Date(event.endTime).getTime() + diffMs);

      const yyyy = current.getUTCFullYear();
      const mm = String(current.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(current.getUTCDate()).padStart(2, "0");
      const newDateStr = `${yyyy}-${mm}-${dd}`;

      occurrences.push({
        ...event,
        date: newDateStr,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
      });
    }

    // Increment current based on repeat rule
    if (event.repeat === "day") {
      current.setUTCDate(current.getUTCDate() + 1);
    } else if (event.repeat === "week") {
      current.setUTCDate(current.getUTCDate() + 7);
    } else if (event.repeat === "month") {
      current.setUTCMonth(current.getUTCMonth() + 1);
    } else if (event.repeat === "year") {
      current.setUTCFullYear(current.getUTCFullYear() + 1);
    } else {
      // In case of unexpected repeat string
      break;
    }
    sanityCheck++;
  }

  return occurrences;
}
