import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface MemberCardProps {
  username: string;
  isMemberAdmin: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  onPress?: () => void;
  setRemoteModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setBanModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setUnBanModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSelected: (username: string) => void;
}

export default function MemberCard({
  username,
  isMemberAdmin,
  isAdmin,
  isBanned,
  onPress,
  setRemoteModalVisible,
  setBanModalVisible,
  setUnBanModalVisible,
  setSelected,
}: MemberCardProps) {
  const { colors } = useAppTheme();
  const styles = useFriendsStyles();

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={
          isBanned
            ? [styles.card, { backgroundColor: colors.border }]
            : styles.card
        }
      >
        <View style={styles.cardContent}>
          {isMemberAdmin ? (
            <Text style={styles.admin} numberOfLines={2}>
              Admin
            </Text>
          ) : null}
          {isBanned ? (
            <Text style={styles.admin} numberOfLines={2}>
              Banned
            </Text>
          ) : null}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(username)}</Text>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {username}
              </Text>
              {isAdmin && !isBanned ? (
                <FontAwesome.Button
                  name="ban"
                  size={20}
                  iconStyle={styles.icon}
                  style={
                    isBanned
                      ? [styles.iconButton, { backgroundColor: colors.border }]
                      : styles.iconButton
                  }
                  onPress={() => {
                    setBanModalVisible(true);
                    setSelected(username);
                  }}
                />
              ) : null}
              {isAdmin && !isBanned ? (
                <Ionicons.Button
                  name="person-remove-outline"
                  size={20}
                  iconStyle={styles.icon}
                  style={styles.iconButton}
                  onPress={() => {
                    setRemoteModalVisible(true);
                    setSelected(username);
                  }}
                />
              ) : null}
              {isBanned ? (
                <FontAwesome.Button
                  name="user-check"
                  size={20}
                  iconStyle={styles.icon}
                  style={
                    isBanned
                      ? [styles.iconButton, { backgroundColor: colors.border }]
                      : styles.iconButton
                  }
                  onPress={() => {
                    setUnBanModalVisible(true);
                    setSelected(username);
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
