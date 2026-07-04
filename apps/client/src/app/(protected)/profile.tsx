/* eslint-disable prettier/prettier */
import { useProfileStyles } from "@/constants/styles/useProfileStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { authClient } from "@/lib/auth";
import { userService } from "@/services/userService";
import { useProfileViewModel } from "@/viewmodels/useProfileViewModel";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Image, Text, TouchableHighlight, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const styles = useProfileStyles();
  const router = useRouter();
  const { colors } = useAppTheme();

  const { profile, bypassAuth } = useAuthState();

  if(!profile && !bypassAuth) {
    router.push("/(onboarding)/createProfile");
  }
  const vm = useProfileViewModel(profile ?? {
    username: "Developer", 
    photo: null, 
    description: "Just a developer profile", 
    userId: "fKagbUx7LwvE72kxf0PL7cdd7AjncKBT", 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString()
  });

  useFocusEffect(
    useCallback(() => {
      vm.refetchFriends();
      vm.refetchEvents();
      vm.refetchGroups();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <Ionicons.Button name="settings" size={23} iconStyle={styles.icon} style={styles.iconButton} onPress={vm.navigateToSettings}/>
        <FontAwesome.Button name="edit" size={23} iconStyle={styles.icon} style={styles.iconButton} onPress={vm.navigateToEditProfile} />
      </View>

      <View style={styles.profileView}>
        <Image
          style={styles.profileImage}
          source={ profile?.photo?  
            { uri: userService.getUserPhotoUrl(profile.username, profile.updatedAt),
              headers: {
                Cookie: authClient.getCookie() || "",
              },
            }
            : require("@/assets/images/profileImg.png")
          }
        />
      </View>

      <Text style={styles.title}>{ bypassAuth ? "Developer" : profile?.username }</Text>

      <View style={styles.profileStats}>
        <TouchableHighlight
          underlayColor={colors.background}
          activeOpacity={0.5}
          onPress={vm.navigateToFriends}
        >
          <View style={styles.column}>
            <Text style={styles.subTitle2}>Friends</Text>
            <Text style={styles.subTitle}>{vm.numberOfFriends}</Text>
          </View>
        </TouchableHighlight>
        <View style={styles.columnDivider}></View>
        <TouchableHighlight
          underlayColor={colors.background}
          activeOpacity={0.5}
          onPress={vm.navigateToCalendar}
        >
          <View style={styles.column}>
            <Text style={styles.subTitle2}>Events</Text>
            <Text style={styles.subTitle}>{vm.numberOfEvents}</Text>
          </View>
        </TouchableHighlight>
        <View style={styles.columnDivider}></View>
        <TouchableHighlight
          underlayColor={colors.background}
          activeOpacity={0.5}
          onPress={vm.navigateToGroups}
        >
          <View style={styles.column}>
            <Text style={styles.subTitle2}>Groups</Text>
            <Text style={styles.subTitle}>{vm.numberOfGroups}</Text>
          </View>
        </TouchableHighlight>
      </View>
      <View style={styles.description}>
        <Text style={styles.subTitleOnPrimary}>About me</Text>
        <Text style={styles.textOnPrimary}>
          {bypassAuth? "Just a developer profile" : profile?.description}
        </Text>
      </View>
    </SafeAreaView>
  );
}
