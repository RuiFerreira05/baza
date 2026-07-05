import { useGroupListStyles } from "@/constants/styles/useGroupListStyles";
import { authClient } from "@/lib/auth";
import { groupService } from "@/services/groupService";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

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
  const styles = useGroupListStyles();
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(protected)/personal/groupSection/group/${id}/calendar`);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.avatar}>
              {photo ? (
                <Image
                  source={{
                    uri: groupService.getGroupPhotoUrl(id, photo),
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
    </TouchableOpacity>
  );
}
