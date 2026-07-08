import { formatLocation } from "@/lib/location";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getUsernameColor } from "@/viewmodels/useGroupCalendarViewModel";
import { PersonalEventDTO } from "@baza/shared-types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MemberEventCardProps {
  event: PersonalEventDTO;
}

export default function MemberEventCard({ event }: MemberEventCardProps) {
  const { colors } = useAppTheme();
  const isPrivate = !event.public;
  const memberColor = getUsernameColor(event.username);

  const formatTimeStr = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "";
    }
  };

  return (
    <View
      style={[
        styles.memberCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={[styles.memberDot, { backgroundColor: memberColor }]} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.memberName, { color: colors.onSurface }]}>
            {event.username}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {isPrivate ? (
              <Ionicons
                name="lock-closed"
                size={12}
                color={colors.placeholder}
              />
            ) : null}
            <Text
              style={[
                styles.memberEventTitle,
                {
                  color: isPrivate
                    ? colors.placeholder
                    : colors.onSurfaceVariant,
                },
              ]}
            >
              {isPrivate ? "Busy (Private event)" : event.title}
            </Text>
          </View>
          {event.location && !isPrivate ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                flexShrink: 1,
              }}
            >
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={[
                  {
                    color: colors.onSurfaceVariant,
                    fontSize: 12,
                    flexShrink: 1,
                  },
                ]}
                numberOfLines={1}
              >
                {formatLocation(event.location)}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.memberTimeContainer}>
          <Text
            style={[styles.memberTimeText, { color: colors.onSurfaceVariant }]}
          >
            {event.allDay
              ? "All Day"
              : `${formatTimeStr(event.startTime)} - ${formatTimeStr(event.endTime)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  memberCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  memberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  memberName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  memberEventTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  memberTimeContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  memberTimeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
