import { useEventPreferencesStyles } from "@/constants/styles/useEventPreferencesStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

interface GroupPreferencesDashboardProps {
  groupPreferenceReport: any;
  allPreferences: any[];
}

const formatDateLong = (dateStr: string) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export default function GroupPreferencesDashboard({
  groupPreferenceReport,
  allPreferences,
}: GroupPreferencesDashboardProps) {
  const { colors } = useAppTheme();
  const styles = useEventPreferencesStyles();

  // Aggregate dislikes locally from non-private preferences
  const negativeFeedback = useMemo(() => {
    const nonPrivatePrefs = allPreferences.filter((p) => !p.private);
    return nonPrivatePrefs
      .map((p) => p.preference?.negativePreferences)
      .filter(
        (text): text is string =>
          typeof text === "string" && text.trim().length > 0,
      );
  }, [allPreferences]);

  if (!groupPreferenceReport) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="people-outline" size={48} color={colors.placeholder} />
        <Text
          style={[
            styles.emptyText,
            { color: colors.onSurfaceVariant, marginTop: 8 },
          ]}
        >
          No group preferences available yet.
        </Text>
      </View>
    );
  }

  const {
    submittedCount,
    totalGroupMembers,
    budgetOverlap,
    timeOfDayVotes,
    durationVotes,
    environmentVotes,
    dateVotes,
    activityVotes,
    estimatedGroupSize,
  } = groupPreferenceReport;

  // Sorting helper for activity and date rankings
  const sortedActivities = Object.entries(activityVotes || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const sortedDates = Object.entries(dateVotes || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  return (
    <View style={styles.groupDashboard}>
      {/* Summary Banner */}
      <View
        style={[styles.summaryCard, { backgroundColor: colors.primary + "15" }]}
      >
        <Ionicons name="people" size={24} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.summaryTitle, { color: colors.primary }]}>
            Joined Preferences ({submittedCount}/{totalGroupMembers} submitted)
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.onSurfaceVariant,
              marginTop: 2,
            }}
          >
            Aggregated results from the group workspace members.
          </Text>
        </View>
      </View>

      {/* Date Availability Chart */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Top Available Days
        </Text>
        {sortedDates.length > 0 ? (
          <View style={styles.chartContainer}>
            {sortedDates.map(([date, votes]) => {
              const pct =
                submittedCount > 0
                  ? ((votes as number) / submittedCount) * 100
                  : 0;
              return (
                <View key={date} style={styles.chartRow}>
                  <Text
                    style={[styles.chartRowLabel, { color: colors.onSurface }]}
                    numberOfLines={1}
                  >
                    {formatDateLong(date)}
                  </Text>
                  <View style={styles.chartBarWrapper}>
                    <View
                      style={[
                        styles.chartBar,
                        { width: `${pct}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.chartRowValue,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {votes as number} {votes === 1 ? "user" : "users"}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
            No availability dates submitted yet.
          </Text>
        )}
      </View>

      {/* Activities Recommendations */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Preferred Activities
        </Text>
        {sortedActivities.length > 0 ? (
          <View style={styles.chartContainer}>
            {sortedActivities.map(([act, votes]) => {
              const pct =
                submittedCount > 0
                  ? ((votes as number) / submittedCount) * 100
                  : 0;
              return (
                <View key={act} style={styles.chartRow}>
                  <Text
                    style={[
                      styles.chartRowLabel,
                      styles.capitalize,
                      { color: colors.onSurface },
                    ]}
                    numberOfLines={1}
                  >
                    {act}
                  </Text>
                  <View style={styles.chartBarWrapper}>
                    <View
                      style={[
                        styles.chartBar,
                        { width: `${pct}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.chartRowValue,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {votes as number} {votes === 1 ? "vote" : "votes"}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
            No preferred activities submitted yet.
          </Text>
        )}
      </View>

      {/* Budget Overlap */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Group Budget Range
        </Text>
        <View style={styles.budgetOverlapContainer}>
          <Ionicons name="cash-outline" size={20} color={colors.primary} />
          {budgetOverlap &&
          (budgetOverlap.overlapMin !== null ||
            budgetOverlap.overlapMax !== null) ? (
            <Text
              style={[styles.budgetOverlapText, { color: colors.onSurface }]}
            >
              Overlapping range:{" "}
              <Text style={styles.boldText}>
                {budgetOverlap.overlapMin !== null
                  ? `${budgetOverlap.overlapMin}€`
                  : "0€"}{" "}
                -{" "}
                {budgetOverlap.overlapMax !== null
                  ? `${budgetOverlap.overlapMax}€`
                  : "unlimited"}
              </Text>
            </Text>
          ) : (
            <Text
              style={[
                styles.budgetOverlapText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              No overlapping budget range found.
            </Text>
          )}
        </View>
      </View>

      {/* Time and Environment preferences side-by-side */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Time of Day & Environment
        </Text>
        <View style={{ gap: 16 }}>
          {/* Time of Day */}
          <View>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
                color: colors.onSurface,
                marginBottom: 8,
              }}
            >
              Preferred Hours
            </Text>
            <View style={styles.chartContainer}>
              {["morning", "afternoon", "evening", "night"].map((t) => {
                const votes = timeOfDayVotes?.[t] || 0;
                const pct =
                  submittedCount > 0 ? (votes / submittedCount) * 100 : 0;
                return (
                  <View key={t} style={styles.chartRow}>
                    <Text
                      style={[
                        styles.chartRowLabel,
                        styles.capitalize,
                        { color: colors.onSurface },
                      ]}
                    >
                      {t}
                    </Text>
                    <View style={styles.chartBarWrapper}>
                      <View
                        style={[
                          styles.chartBar,
                          { width: `${pct}%`, backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.chartRowValue,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {votes}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Environment */}
          <View>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
                color: colors.onSurface,
                marginBottom: 8,
              }}
            >
              Inside/Outdoors
            </Text>
            <View style={styles.chartContainer}>
              {[
                { key: "inside", label: "Indoor" },
                { key: "outdoors", label: "Outdoor" },
                { key: "both", label: "No Preference" },
              ].map((item) => {
                const votes = environmentVotes?.[item.key] || 0;
                const pct =
                  submittedCount > 0 ? (votes / submittedCount) * 100 : 0;
                return (
                  <View key={item.key} style={styles.chartRow}>
                    <Text
                      style={[
                        styles.chartRowLabel,
                        { color: colors.onSurface },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <View style={styles.chartBarWrapper}>
                      <View
                        style={[
                          styles.chartBar,
                          { width: `${pct}%`, backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.chartRowValue,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {votes}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* Estimated Group Size & Duration metrics */}
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Group Metrics
        </Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownValue, { color: colors.primary }]}>
              {estimatedGroupSize?.average !== null &&
              estimatedGroupSize?.average !== undefined
                ? Math.round(estimatedGroupSize.average)
                : "-"}
            </Text>
            <Text
              style={[
                styles.breakdownLabel,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Avg Group Size
            </Text>
          </View>

          <View
            style={{ width: 1, height: 40, backgroundColor: colors.border }}
          />

          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownValue, { color: colors.primary }]}>
              {(() => {
                const maxVal = Math.max(
                  durationVotes?.short || 0,
                  durationVotes?.medium || 0,
                  durationVotes?.long || 0,
                );
                if (maxVal === 0) return "-";
                if (maxVal === durationVotes?.short) return "Short";
                if (maxVal === durationVotes?.medium) return "Med";
                return "Long";
              })()}
            </Text>
            <Text
              style={[
                styles.breakdownLabel,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Ideal Duration
            </Text>
          </View>
        </View>
      </View>

      {/* Dislikes / Things to Avoid */}
      {negativeFeedback.length > 0 ? (
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            Dislikes / Things to Avoid
          </Text>
          <View style={styles.dislikesList}>
            {negativeFeedback.map((feedback, idx) => (
              <View key={idx} style={styles.dislikeItem}>
                <Ionicons
                  name="remove-circle-outline"
                  size={16}
                  color={colors.error}
                  style={{ marginTop: 2 }}
                />
                <Text style={[styles.dislikeText, { color: colors.onSurface }]}>
                  &quot;{feedback}&quot;
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
