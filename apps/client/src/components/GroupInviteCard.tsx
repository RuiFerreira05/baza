import { useGroupListStyles } from "@/constants/styles/useGroupListStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface GroupInviteCardProps {
  groupname: string;
  description?: string | null;
  onAccept: () => void;
  onDecline: () => void;
  isResponding?: boolean;
}

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/[\s_-]+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function GroupInviteCard({
  groupname,
  description,
  onAccept,
  onDecline,
  isResponding = false,
}: GroupInviteCardProps) {
  const { colors } = useAppTheme();
  const styles = useGroupListStyles();

  return (
    <View style={styles.card}>
      <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(groupname)}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {groupname}
            </Text>
          </View>
        </View>

        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}

        <Text style={styles.inviteNote}>Invited you to join</Text>

        <View style={styles.actions}>
          <Pressable
            style={[
              styles.declineButton,
              isResponding && styles.disabledButton,
            ]}
            disabled={isResponding}
            onPress={onDecline}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </Pressable>

          <Pressable
            style={[styles.acceptButton, isResponding && styles.disabledButton]}
            disabled={isResponding}
            onPress={onAccept}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
