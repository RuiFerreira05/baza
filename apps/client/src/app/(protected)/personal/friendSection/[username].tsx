import { useProfileStyles } from "@/constants/styles/useProfileStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { authClient } from "@/lib/auth";
import { userService } from "@/services/userService";
import { useFriendProfileViewModel } from "@/viewmodels/useFriendProfileViewModel";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendProfileScreen() {
  const styles = useProfileStyles();
  const router = useRouter();
  const { colors } = useAppTheme();

  const { profile, bypassAuth } = useAuthState();

  if (!profile && !bypassAuth) {
    router.push("/(onboarding)/createProfile");
  }

  const params = useLocalSearchParams<{ username: string }>();

  const vm = useFriendProfileViewModel(
    profile ?? {
      username: "Developer",
      photo: null,
      description: "Just a developer profile",
      userId: "fKagbUx7LwvE72kxf0PL7cdd7AjncKBT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    params.username,
  );

  useEffect(() => {
    if (vm.isError) {
      router.push("/(protected)/personal/friendSection/friendList/friends");
    }
  }, [vm.isError]);

  useFocusEffect(
    useCallback(() => {
      vm.refetchProfile();
      vm.refetchFriends();
      vm.refetchEvents();
      vm.refetchGroups();
    }, []),
  );

  if (vm.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.friendContainer}>
      <View style={styles.profileView}>
        <Image
          style={styles.profileImage}
          source={
            vm.friendProfile?.photo
              ? {
                  uri: userService.getUserPhotoUrl(
                    vm.friendProfile.username,
                    vm.friendProfile.updatedAt,
                  ),
                  headers: {
                    Cookie: authClient.getCookie() || "",
                  },
                }
              : require("@/assets/images/profileImg.png")
          }
        />
      </View>

      <Text style={styles.title}>
        {bypassAuth ? "Developer" : vm.friendProfile?.username}
      </Text>

      <View style={styles.profileStats}>
        <TouchableHighlight
          underlayColor={colors.background}
          activeOpacity={0.5}
        >
          <View style={styles.column}>
            <Text style={styles.subTitle2}>Friends</Text>
            <Text style={styles.subTitle}>{vm.numberOfFriends.toString()}</Text>
          </View>
        </TouchableHighlight>
        <View style={styles.columnDivider}></View>
        <TouchableHighlight
          underlayColor={colors.background}
          activeOpacity={0.5}
        >
          <View style={styles.column}>
            <Text style={styles.subTitle2}>Events</Text>
            <Text style={styles.subTitle}>{vm.numberOfEvents.toString()}</Text>
          </View>
        </TouchableHighlight>
        <View style={styles.columnDivider}></View>
        <TouchableHighlight
          underlayColor={colors.background}
          activeOpacity={0.5}
        >
          <View style={styles.column}>
            <Text style={styles.subTitle2}>Groups</Text>
            <Text style={styles.subTitle}>{vm.numberOfGroups.toString()}</Text>
          </View>
        </TouchableHighlight>
      </View>
      <View style={styles.description}>
        <Text style={styles.subTitleOnPrimary}>About me</Text>
        <Text style={styles.textOnPrimary}>
          {bypassAuth
            ? "Just a developer profile"
            : vm.friendProfile?.description}
        </Text>
      </View>
    </SafeAreaView>
  );
}
