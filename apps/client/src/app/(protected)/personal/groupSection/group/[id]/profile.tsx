import BasicModal from "@/components/BasicModal";
import { useGroupProfileStyles } from "@/constants/styles/useGroupProfileStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { useGroupInfo } from "@/hooks/useGroupInfo";
import { authClient } from "@/lib/auth";
import { groupService } from "@/services/groupService";
import { useGroupProfileViewModel } from "@/viewmodels/useGroupProfileViewModel";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableHighlight,
  View,
} from "react-native";

export default function GroupProfileScreen() {
  const styles = useGroupProfileStyles();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { data, error, isLoading } = useGroupInfo();
  const { profile, bypassAuth } = useAuthState();
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (!profile && !bypassAuth) {
    router.push("/(onboarding)/createProfile");
  }

  const vm = useGroupProfileViewModel(
    data ?? {
      groupname: "Developers",
      photo: null,
      description: "Just a developer profile",
      id: "fKagbUx7LwvE72kxf0PL7cdd7AjncKBT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.trim().charAt(0).toUpperCase();
  };

  const leaveGroup = (groupId: string, username: string) => {
    groupService.removeUser(groupId, username);
    setIsModalVisible(false);
    router.replace("/(protected)/personal/groupSection/groupList/groups");
  };

  const isAdmin = () => {
    let isAdmin = false;
    vm.members?.forEach((member) => {
      if (member.username === profile?.username && member.admin) {
        isAdmin = true;
      }
    });
    return isAdmin;
  };

  useFocusEffect(
    useCallback(() => {
      vm.refetchMembers();
      vm.refetchEvents();
    }, []),
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || "Failed to load group."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons.Button
          name="exit-outline"
          size={25}
          iconStyle={styles.icon}
          style={styles.iconButton}
          onPress={() => setIsModalVisible(true)}
        />
        {isAdmin() ? (
          <FontAwesome.Button
            name="edit"
            size={23}
            iconStyle={styles.icon}
            style={styles.iconButton}
            onPress={vm.navigateToEditProfile}
          />
        ) : null}
      </View>

      <View style={styles.profileView}>
        {data?.photo ? (
          <Image
            source={{
              uri: groupService.getGroupPhotoUrl(data!.id, data?.updatedAt),
              headers: {
                Cookie: authClient.getCookie() || "",
              },
            }}
            style={styles.profileImage}
          />
        ) : (
          <Text style={styles.avatarText}>
            {getInitials(data?.groupname ?? "")}
          </Text>
        )}
      </View>

      <Text style={styles.title}>
        {bypassAuth ? "Developers Group" : data?.groupname}
      </Text>

      <View style={styles.profileStats}>
        <View style={{ width: "50%", alignItems: "center" }}>
          <TouchableHighlight
            underlayColor={colors.background}
            activeOpacity={0.5}
            style={{ width: "100%" }}
            // onPress={}
          >
            <View style={styles.column}>
              <Text style={styles.subTitle2}>Members</Text>
              <Text style={styles.subTitle}>{vm.numberOfMembers}</Text>
            </View>
          </TouchableHighlight>
        </View>

        <View style={styles.columnDivider}></View>

        <View style={{ width: "50%", alignItems: "center" }}>
          <TouchableHighlight
            underlayColor={colors.background}
            activeOpacity={0.5}
            style={{ width: "100%" }}
            onPress={vm.navigateToCalendar}
          >
            <View style={styles.column}>
              <Text style={styles.subTitle2}>Events</Text>
              <Text style={styles.subTitle}>{vm.numberOfEvents}</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>

      <View style={styles.description}>
        <Text style={styles.subTitleOnPrimary}>Description</Text>
        <Text style={styles.textOnPrimary}>
          {bypassAuth
            ? "Just a group of developers suffering"
            : data?.description}
        </Text>
      </View>
      <BasicModal
        modalText={`Leave ${data?.groupname ?? "group"}?`}
        actionText="Leave"
        modalVisible={isModalVisible}
        onBackPress={() => setIsModalVisible(false)}
        onActionPress={() =>
          bypassAuth || !profile || !data
            ? setIsModalVisible(false)
            : leaveGroup(data.id, profile.username)
        }
        onCancelPress={() => setIsModalVisible(false)}
        onRequestClose={() => setIsModalVisible(false)}
        isLoading={false}
      />
    </View>
  );
}
