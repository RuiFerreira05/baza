import { useGroupListStyles } from "@/constants/styles/useGroupListStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { authClient } from "@/lib/auth";
import { groupService } from "@/services/groupService";
import React from "react";
import { Image, Text, View } from "react-native";

interface GroupCardProps {
  id: string;
  groupname: string;
  description?: string | null;
  photo?: string | null;
}

const getInitials = (name: string) => {
  if (!name) return "";
  return name.trim().charAt(0).toUpperCase();
};

export default function GroupCard({
  id,
  groupname,
  description,
  photo,
}: GroupCardProps) {
  const { colors } = useAppTheme();
  const styles = useGroupListStyles();

  return (
    <View style={styles.card}>
      <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.avatar}>
              {photo ? (
                <Image
                  source={{
                    uri: groupService.getGroupPhotoUrl(id),
                    headers: {
                      Cookie: authClient.getCookie() || "",
                    },
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{getInitials(groupname)}</Text>
              )}
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
