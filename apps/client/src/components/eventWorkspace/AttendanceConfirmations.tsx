import { useEventDetailsStyles } from "@/constants/styles/useEventDetailsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Platform, Switch, Text, View } from "react-native";

interface AttendanceConfirmationsProps {
  confirmations: {
    username: string;
    groupId: string;
    eventId: string;
    confirmedAt: string;
  }[];
  myUsername: string | null;
  isConfirming: boolean;
  onConfirm: () => Promise<any>;
  onRevoke: () => Promise<any>;
}

export default function AttendanceConfirmations({
  confirmations,
  myUsername,
  isConfirming,
  onConfirm,
  onRevoke,
}: AttendanceConfirmationsProps) {
  const { colors } = useAppTheme();
  const styles = useEventDetailsStyles();

  // Calculate stats
  const attendingCount = confirmations.length;

  // Find current user's confirmation status
  const myConfirmation = confirmations.find((c) => c.username === myUsername);
  const isGoing = !!myConfirmation;

  const handleToggle = async (value: boolean) => {
    if (value) {
      await onConfirm();
    } else {
      await onRevoke();
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.attendanceHeader}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Who&apos;s Attending?
        </Text>
        <View style={styles.attendanceStats}>
          <Text style={[styles.attendanceStatsText, { color: colors.primary }]}>
            {attendingCount} going
          </Text>
        </View>
      </View>

      {/* RSVP Confirmation Toggle */}
      <View style={styles.confirmationToggleRow}>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleTitle, { color: colors.onSurface }]}>
            Are you going?
          </Text>
          <Text style={[styles.toggleSub, { color: colors.onSurfaceVariant }]}>
            Confirm your attendance for this event
          </Text>
        </View>
        {isConfirming ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
        ) : (
          <Switch
            value={isGoing}
            onValueChange={handleToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === "android" ? colors.surface : undefined}
          />
        )}
      </View>

      <View style={styles.divider} />

      {/* Confirmations List */}
      <View style={styles.confirmationsList}>
        {confirmations.length > 0 ? (
          confirmations.map((item) => {
            const initials = item.username.slice(0, 2).toUpperCase();

            return (
              <View key={item.username} style={styles.confirmationItem}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: colors.success + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color: colors.success,
                      },
                    ]}
                  >
                    {initials}
                  </Text>
                </View>
                <Text
                  style={[styles.confirmationUser, { color: colors.onSurface }]}
                >
                  {item.username}
                </Text>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.success}
                  style={styles.confirmedIcon}
                />
              </View>
            );
          })
        ) : (
          <View style={styles.emptyAttendance}>
            <Text
              style={[
                styles.emptyAttendanceText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              No attendance confirmations yet.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
