import { useAppTheme } from "@/hooks/useAppTheme";
import { GroupEventDTO } from "@baza/shared-types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface GroupCalendarEventCardProps {
  event: GroupEventDTO;
  onPress: () => void;
}

export default function GroupCalendarEventCard({
  event,
  onPress,
}: GroupCalendarEventCardProps) {
  const { colors } = useAppTheme();
  const isResolved = event.state === "finished";
  const statusColor = isResolved ? colors.success : "#F59E0B";

  const getPlanningTimeLeft = (votingEndTime: string | null) => {
    if (!votingEndTime) return "";
    const now = new Date().getTime();
    const end = new Date(votingEndTime).getTime();
    const diff = end - now;
    if (diff <= 0) return "Voting ended";
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`;
  };

  return (
    <Pressable
      style={[
        styles.eventCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.eventCardHeader}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name={
                isResolved ? "checkmark-circle-outline" : "calendar-outline"
              }
              size={16}
              color={statusColor}
            />
            <Text style={[styles.eventCardTitle, { color: colors.onSurface }]}>
              {event.title}
            </Text>
          </View>
          {event.description ? (
            <Text
              style={[styles.eventCardDesc, { color: colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {event.description}
            </Text>
          ) : null}
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isResolved
              ? "Finalized"
              : event.state === "needs_tiebreaker"
                ? "Tie Breaker"
                : getPlanningTimeLeft(event.votingEndTime) || "Planning"}
          </Text>
        </View>
      </View>

      {isResolved && event.winningPlan ? (
        <View
          style={[
            styles.winningPlanContainer,
            { borderTopColor: colors.border },
          ]}
        >
          <Text
            style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}
          >
            Plan:{" "}
            <Text style={{ color: colors.onSurface, fontWeight: "600" }}>
              {event.winningPlan.title}
            </Text>
          </Text>
          <Text
            style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}
          >
            Location:{" "}
            <Text style={{ color: colors.onSurface, fontWeight: "600" }}>
              {event.winningPlan.location}
            </Text>
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.winningPlanContainer,
            { borderTopColor: colors.border },
          ]}
        >
          <Text
            style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}
          >
            Planning:{" "}
            <Text style={{ color: colors.onSurface, fontWeight: "500" }}>
              {event.startDate} to {event.endDate}
            </Text>
          </Text>
        </View>
      )}

      <Text style={[styles.creatorText, { color: colors.placeholder }]}>
        Proposed by {event.createdBy}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eventCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  eventCardDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  winningPlanContainer: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    gap: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  creatorText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    alignSelf: "flex-end",
    marginTop: 4,
  },
});
