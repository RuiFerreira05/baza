import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface FriendRequestCardProps {
  otherUser: string;
  sentAt: string;
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

export default function FriendRequestCard({
  otherUser,
  sentAt,
  onAccept,
  onDecline,
  isResponding = false,
}: FriendRequestCardProps) {
  const { colors } = useAppTheme();
  const styles = useFriendsStyles();

  return (
    <View style={styles.card}>
      <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(otherUser)}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {otherUser}
            </Text>
          </View>
        </View>

        <Text style={styles.sentAt} numberOfLines={2}>
          {sentAt}
        </Text>

        <Text style={styles.requestNote}>Wants to befriend you!</Text>

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
