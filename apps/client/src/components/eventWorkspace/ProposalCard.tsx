import { formatLocation } from "@/lib/location";
import { useEventProposalsStyles } from "@/constants/styles/useEventProposalsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface ProposalCardProps {
  plan: any;
  isPlanning: boolean;
  isTieBreaker: boolean;
  isTied: boolean;
  isCreator: boolean;
  isResolvingTie: boolean;
  onVoteToggle: (planId: string, hasVoted: boolean) => void;
  onResolveTie: (planId: string) => void;
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

export default function ProposalCard({
  plan,
  isPlanning,
  isTieBreaker,
  isTied,
  isCreator,
  isResolvingTie,
  onVoteToggle,
  onResolveTie,
}: ProposalCardProps) {
  const { colors } = useAppTheme();
  const styles = useEventProposalsStyles();

  const hasVoted = !!plan.hasVoted;

  return (
    <View
      style={[
        styles.planCard,
        isTied && { borderColor: colors.error, borderWidth: 1.5 },
      ]}
    >
      {/* Top Row: Title & Proposer */}
      <View style={styles.planHeader}>
        <View style={styles.planTitleContainer}>
          <Text style={[styles.planTitle, { color: colors.onSurface }]}>
            {plan.title}
          </Text>
          <Text
            style={[styles.planProposer, { color: colors.onSurfaceVariant }]}
          >
            Proposed by <Text style={styles.boldText}>{plan.username}</Text>
          </Text>
        </View>

        {/* Badges Container */}
        <View style={styles.badgeRow}>
          {isTied && (
            <View
              style={[
                styles.tiedBadge,
                { backgroundColor: colors.error + "15" },
              ]}
            >
              <Text style={[styles.tiedBadgeText, { color: colors.error }]}>
                Tied Option
              </Text>
            </View>
          )}
          <View
            style={[
              styles.voteCountBadge,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <Text style={[styles.voteCountText, { color: colors.primary }]}>
              {plan.votesCount ?? 0} {plan.votesCount === 1 ? "vote" : "votes"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Plan Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Ionicons
            name="location-outline"
            size={15}
            color={colors.onSurfaceVariant}
          />
          <Text
            style={[styles.detailText, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {formatLocation(plan.location)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color={colors.onSurfaceVariant}
          />
          <Text style={[styles.detailText, { color: colors.onSurface }]}>
            {formatDateLong(plan.date)} at{" "}
            {plan.allDay
              ? "All-Day"
              : `${formatTime(plan.startTime)} - ${formatTime(plan.endTime)}`}
          </Text>
        </View>

        {plan.activity ? (
          <View style={styles.detailRow}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[styles.detailText, { color: colors.onSurface }]}
              numberOfLines={2}
            >
              {plan.activity}
            </Text>
          </View>
        ) : null}

        {plan.minBudget !== null || plan.maxBudget !== null ? (
          <View style={styles.detailRow}>
            <Ionicons
              name="cash-outline"
              size={15}
              color={colors.onSurfaceVariant}
            />
            <Text style={[styles.detailText, { color: colors.onSurface }]}>
              Budget:{" "}
              {plan.minBudget !== null && plan.maxBudget !== null
                ? `${plan.minBudget}€ - ${plan.maxBudget}€`
                : plan.minBudget !== null
                  ? `From ${plan.minBudget}€`
                  : `Up to ${plan.maxBudget}€`}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action Buttons Row */}
      <View style={styles.cardActionsRow}>
        {isPlanning && (
          <Pressable
            style={[
              styles.voteButton,
              { borderColor: colors.primary },
              hasVoted
                ? { backgroundColor: colors.primary }
                : { backgroundColor: "transparent", borderWidth: 1 },
            ]}
            onPress={() => onVoteToggle(plan.id, hasVoted)}
          >
            <Ionicons
              name={hasVoted ? "checkmark" : "chevron-up"}
              size={16}
              color={hasVoted ? colors.onPrimary : colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.voteButtonText,
                { color: hasVoted ? colors.onPrimary : colors.primary },
              ]}
            >
              {hasVoted ? "Voted" : "Vote"}
            </Text>
          </Pressable>
        )}

        {isTieBreaker && isCreator && isTied && (
          <Pressable
            style={[styles.resolveButton, { backgroundColor: colors.success }]}
            onPress={() => onResolveTie(plan.id)}
            disabled={isResolvingTie}
          >
            {isResolvingTie ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={colors.onPrimary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.resolveButtonText,
                    { color: colors.onPrimary },
                  ]}
                >
                  Select Winner
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
