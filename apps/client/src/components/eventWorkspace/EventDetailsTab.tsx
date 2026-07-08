import { formatLocation } from "@/lib/location";
import { useEventDetailsStyles } from "@/constants/styles/useEventDetailsStyles";
import { useEventWorkspaceViewModel } from "@/viewmodels/useEventWorkspaceViewModel";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import AttendanceConfirmations from "./AttendanceConfirmations";

interface EventTabProps {
  groupId: string;
  eventId: string;
  colors: any;
}

const formatDateLong = (dateStr: string) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const parts = timeStr.replace("Z", "").split(":");
  return `${parts[0]}:${parts[1]}`;
};

export default function EventDetailsTab({
  groupId,
  eventId,
  colors,
}: EventTabProps) {
  const vm = useEventWorkspaceViewModel(groupId, eventId);
  const styles = useEventDetailsStyles();

  if (vm.isLoading) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (vm.error) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {vm.error}
        </Text>
      </View>
    );
  }

  const event = vm.eventDetails;
  if (!event) return null;

  // Format stage badge
  let stageLabel = "Planning";
  let stageColor = colors.primary;
  let stageBg = colors.surfaceVariant;
  let stageIcon: any = "calendar-outline";

  if (vm.stage === "needs_tiebreaker") {
    stageLabel = "Awaiting Tie-Breaker";
    stageColor = colors.error;
    stageBg = colors.error + "15";
    stageIcon = "git-branch-outline";
  } else if (vm.stage === "planned") {
    stageLabel = "Planned";
    stageColor = colors.success;
    stageBg = colors.success + "15";
    stageIcon = "checkmark-circle-outline";
  } else if (vm.stage === "completed") {
    stageLabel = "Completed";
    stageColor = colors.onSurfaceVariant;
    stageBg = colors.border;
    stageIcon = "archive-outline";
  }

  const winningPlan = event.winningPlan;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Event Header Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {event.title}
          </Text>
          <View style={[styles.stageBadge, { backgroundColor: stageBg }]}>
            <Ionicons
              name={stageIcon}
              size={14}
              color={stageColor}
              style={styles.stageIcon}
            />
            <Text style={[styles.stageLabel, { color: stageColor }]}>
              {stageLabel}
            </Text>
          </View>
        </View>

        {event.description ? (
          <Text
            style={[styles.description, { color: colors.onSurfaceVariant }]}
          >
            {event.description}
          </Text>
        ) : null}

        <View style={styles.divider} />

        {/* Info Rows */}
        <View style={styles.infoRow}>
          <Ionicons
            name="person-outline"
            size={16}
            color={colors.onSurfaceVariant}
          />
          <Text style={[styles.infoText, { color: colors.onSurface }]}>
            Created by <Text style={styles.boldText}>{event.createdBy}</Text>
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-clear-outline"
            size={16}
            color={colors.onSurfaceVariant}
          />
          <Text style={[styles.infoText, { color: colors.onSurface }]}>
            Planning range: {formatDateLong(event.startDate)} -{" "}
            {formatDateLong(event.endDate)}
          </Text>
        </View>

        {event.votingEndTime ? (
          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.onSurfaceVariant}
            />
            <Text style={[styles.infoText, { color: colors.onSurface }]}>
              Voting deadline: {new Date(event.votingEndTime).toLocaleString()}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Winning Plan Details (If finalized) */}
      {winningPlan ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Winning Plan Details
          </Text>

          <Text style={[styles.planTitle, { color: colors.onSurface }]}>
            {winningPlan.title}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.onSurfaceVariant}
            />
            <Text style={[styles.infoText, { color: colors.onSurface }]}>
              {formatLocation(winningPlan.location)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.onSurfaceVariant}
            />
            <Text style={[styles.infoText, { color: colors.onSurface }]}>
              {formatDateLong(winningPlan.date)} at{" "}
              {winningPlan.allDay
                ? "All-Day"
                : `${formatTime(winningPlan.startTime)} - ${formatTime(winningPlan.endTime)}`}
            </Text>
          </View>

          {winningPlan.activity ? (
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.onSurfaceVariant}
              />
              <Text style={[styles.infoText, { color: colors.onSurface }]}>
                {winningPlan.activity}
              </Text>
            </View>
          ) : null}

          {winningPlan.minBudget !== null || winningPlan.maxBudget !== null ? (
            <View style={styles.infoRow}>
              <Ionicons
                name="cash-outline"
                size={16}
                color={colors.onSurfaceVariant}
              />
              <Text style={[styles.infoText, { color: colors.onSurface }]}>
                Budget:{" "}
                {winningPlan.minBudget !== null &&
                winningPlan.maxBudget !== null
                  ? `${winningPlan.minBudget}€ - ${winningPlan.maxBudget}€`
                  : winningPlan.minBudget !== null
                    ? `From ${winningPlan.minBudget}€`
                    : `Up to ${winningPlan.maxBudget}€`}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Ionicons
              name="person-circle-outline"
              size={16}
              color={colors.onSurfaceVariant}
            />
            <Text style={[styles.infoText, { color: colors.onSurface }]}>
              Proposed by{" "}
              <Text style={styles.boldText}>{winningPlan.username}</Text>
            </Text>
          </View>
        </View>
      ) : null}

      {/* Attendance Confirmations */}
      {winningPlan ? (
        <AttendanceConfirmations
          confirmations={vm.confirmations}
          myUsername={vm.username}
          isConfirming={vm.isLoading}
          onConfirm={vm.confirmAttendance}
          onRevoke={vm.revokeAttendance}
        />
      ) : null}
    </ScrollView>
  );
}
