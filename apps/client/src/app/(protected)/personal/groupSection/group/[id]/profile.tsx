import { useGroupProfileStyles } from "@/constants/styles/useGroupProfileStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { authClient } from "@/lib/auth";
import { groupService } from "@/services/groupService";
import { useGroupProfileViewModel } from "@/viewmodels/useGroupProfileViewModel";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useGlobalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
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
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { profile, bypassAuth } = useAuthState();

  if (!profile && !bypassAuth) {
    router.push("/(onboarding)/createProfile");
  }

  const vm = useGroupProfileViewModel(id);

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.trim().charAt(0).toUpperCase();
  };

  useFocusEffect(
    useCallback(() => {
      vm.refetchGroup();
      vm.refetchMembers();
      vm.refetchEvents();
    }, []),
  );

  if (vm.isLoading && !vm.groupProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (vm.isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {vm.error?.message || "Failed to load group."}
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
          // onPress={}
        />
        <FontAwesome.Button
          name="edit"
          size={23}
          iconStyle={styles.icon}
          style={styles.iconButton}
          // onPress={}
        />
      </View>

      <View style={styles.profileView}>
        {vm.groupProfile?.photo ? (
          <Image
            source={{
              uri: groupService.getGroupPhotoUrl(id, vm.groupProfile.updatedAt),
              headers: {
                Cookie: authClient.getCookie() || "",
              },
            }}
            style={styles.profileImage}
          />
        ) : (
          <Text style={styles.avatarText}>
            {getInitials(vm.groupProfile!.groupname)}
          </Text>
        )}
      </View>

      <Text style={styles.title}>
        {bypassAuth ? "Developers Group" : vm.groupProfile?.groupname}
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
            : vm.groupProfile?.description}
        </Text>
      </View>
    </View>
  );
}
