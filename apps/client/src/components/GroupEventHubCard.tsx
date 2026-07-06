import { useAppTheme } from "@/hooks/useAppTheme";
import { FormattedGroupEvent } from "@/viewmodels/useGroupEventsViewModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface GroupEventHubCardProps {
  item: FormattedGroupEvent;
  onPress: () => void;
}

export default function GroupEventHubCard({
  item,
  onPress,
}: GroupEventHubCardProps) {
  const { colors } = useAppTheme();
  const evt = item.event;
  const isCompleted = item.isPast;

  const statusColor = isCompleted
    ? colors.disabled
    : evt.state === "finished"
      ? colors.success
      : evt.state === "needs_tiebreaker"
        ? colors.error
        : "#F59E0B"; // planning (amber)

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: isCompleted ? 0.6 : pressed ? 0.9 : 1,
        },
      ]}
      disabled={isCompleted}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 8, gap: 2 }}>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
            {evt.title}
          </Text>
          {evt.description ? (
            <Text
              style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {evt.description}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: statusColor + "15",
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {item.stage}
          </Text>
        </View>
      </View>

      {evt.state === "finished" && evt.winningPlan ? (
        <View
          style={[styles.detailsSection, { borderTopColor: colors.border }]}
        >
          <View style={styles.detailRow}>
            <Ionicons
              name="ribbon-outline"
              size={14}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[styles.detailText, { color: colors.onSurfaceVariant }]}
            >
              Winner Plan:{" "}
              <Text style={{ color: colors.onSurface, fontWeight: "600" }}>
                {evt.winningPlan.title}
              </Text>
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[styles.detailText, { color: colors.onSurfaceVariant }]}
            >
              Location:{" "}
              <Text style={{ color: colors.onSurface, fontWeight: "600" }}>
                {evt.winningPlan.location}
              </Text>
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={[styles.detailsSection, { borderTopColor: colors.border }]}
        >
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[styles.detailText, { color: colors.onSurfaceVariant }]}
            >
              Voting window:{" "}
              <Text style={{ color: colors.onSurface, fontWeight: "500" }}>
                {evt.startDate} to {evt.endDate}
              </Text>
            </Text>
          </View>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={[styles.creatorText, { color: colors.placeholder }]}>
          Proposed by {item.creator}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  detailsSection: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 2,
  },
  creatorText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});
