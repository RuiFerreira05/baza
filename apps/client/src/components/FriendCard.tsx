import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { authClient } from "@/lib/auth";
import { userService } from "@/services/userService";
import React from "react";
import { Image, Text, View } from "react-native";

interface FriendCardProps {
  username: string;
  updatedAt: string;
  photo?: string | null;
}

export default function FriendCard({
  username,
  photo,
  updatedAt,
}: FriendCardProps) {
  const styles = useFriendsStyles();

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={styles.avatar}>
              <Image
                source={
                  photo
                    ? {
                        uri: userService.getUserPhotoUrl(username, updatedAt),
                        headers: {
                          Cookie: authClient.getCookie() || "",
                        },
                      }
                    : require("@/assets/images/profileImg.png")
                }
                style={styles.avatarImage}
              />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {username}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
