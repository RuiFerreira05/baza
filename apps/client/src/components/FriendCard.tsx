import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { authClient } from "@/lib/auth";
import { userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, View } from "react-native";

interface FriendCardProps {
  username: string;
  updatedAt: string;
  photo?: string | null;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelected: (username: string) => void;
}

export default function FriendCard({
  username,
  photo,
  updatedAt,
  setModalVisible,
  setSelected,
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
            <Ionicons.Button
              name="person-remove-outline"
              size={20}
              iconStyle={styles.icon}
              style={styles.iconButton}
              onPress={() => {
                setModalVisible(true);
                setSelected(username);
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
