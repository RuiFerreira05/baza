import { useGroupListStyles } from "@/constants/styles/useGroupListStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import React from "react";
import { Text, View } from "react-native";

interface GroupCardProps {
  groupname: string;
  description?: string | null;
}

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.trim().split(/[\s_-]+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function GroupCard({ groupname, description }: GroupCardProps) {
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
      </View>
    </View>
  );
}
