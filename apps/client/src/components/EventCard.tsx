import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface EventCardProps {
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  location?: string | null;
  repeat?: string;
  isPublic?: boolean;
  onPress?: () => void;
}

export default function EventCard({
  title,
  description,
  startTime,
  endTime,
  allDay,
  location,
  repeat,
  isPublic = false,
  onPress,
}: EventCardProps) {
  const { colors } = useAppTheme();

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "";
    }
  };

  const startFormatted = formatTime(startTime);
  const endFormatted = formatTime(endTime);
  const timeRange = allDay
    ? "All day"
    : startFormatted && endFormatted
      ? `${startFormatted} - ${endFormatted}`
      : "";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {/* Decorative vertical bar on the left */}
      <View style={[styles.indicator, { backgroundColor: colors.primary }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[styles.title, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={styles.badgeRow}>
            {repeat && repeat !== "never" && (
              <Ionicons
                name="repeat-outline"
                size={14}
                color={colors.primary}
                style={styles.badgeIcon}
              />
            )}
            {!isPublic ? (
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
            ) : (
              <Ionicons
                name="people-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
            )}
          </View>
        </View>

        {description ? (
          <Text
            style={[styles.description, { color: colors.onSurfaceVariant }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {timeRange ? (
            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={[styles.infoText, { color: colors.onSurfaceVariant }]}
              >
                {timeRange}
              </Text>
            </View>
          ) : null}

          {location ? (
            <View style={[styles.infoRow, { marginLeft: timeRange ? 16 : 0 }]}>
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={[styles.infoText, { color: colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {location}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    boxShadow: `0px 2px 8px rgba(0, 0, 0, 0.15)`,
  },
  indicator: {
    width: 5,
    height: "100%",
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeIcon: {
    marginRight: 6,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
