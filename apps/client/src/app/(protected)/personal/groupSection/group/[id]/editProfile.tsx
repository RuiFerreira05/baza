import LabeledInput from "@/components/LabeledInput";
import UploadModal from "@/components/UploadModal";
import { useGroupEditProfileStyles } from "@/constants/styles/useGroupEditProfileStyle";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { useGroupInfo } from "@/hooks/useGroupInfo";
import { authClient } from "@/lib/auth";
import { groupService } from "@/services/groupService";
import { useGroupEditProfileViewModel } from "@/viewmodels/useGroupProfileEditViewModel";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Text,
  View,
} from "react-native";
import { KeyboardGestureArea } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const styles = useGroupEditProfileStyles();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { profile, bypassAuth } = useAuthState();
  const { data, error, isLoading } = useGroupInfo();

  if (!profile && !bypassAuth) {
    router.push("/(onboarding)/createProfile");
  }

  const vm = useGroupEditProfileViewModel(
    data || {
      groupname: "Developers",
      photo: null,
      description: "Just a developer profile",
      id: "fKagbUx7LwvE72kxf0PL7cdd7AjncKBT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );

  const removeImage = async () => {
    try {
      vm.saveImage(null);
    } catch (error) {
      alert("Error removing image: " + (error as Error).message);
      vm.setIsModalVisible(false);
    }
  };

  const uploadImage = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await vm.saveImage(result.assets[0].uri);
      }
    } catch (error) {
      alert("Error uploading image: " + (error as Error).message);
      vm.setIsModalVisible(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, width: "100%" }}
      >
        <KeyboardGestureArea
          style={{ flex: 1, width: "100%", alignItems: "center" }}
        >
          <View style={styles.column}>
            <View style={styles.profileView}>
              {data?.photo ? (
                <Image
                  source={{
                    uri: groupService.getGroupPhotoUrl(data.id, data.updatedAt),
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

            <View style={styles.iconContainer}>
              <FontAwesome.Button
                name="edit"
                size={23}
                iconStyle={styles.editicon}
                style={styles.editButton}
                borderRadius={100}
                onPress={() => vm.setIsModalVisible(true)}
              />
            </View>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.form}>
              <LabeledInput
                label="Group name"
                value={vm.groupNameInput!}
                onChangeText={vm.setGroupNameInput}
                placeholder="e.g. john@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                isCorrect={vm.isGroupNameValid}
              />

              <LabeledInput
                label="Description"
                value={vm.descriptionInput ?? ""}
                onChangeText={vm.setDescriptionInput}
                placeholder="Tell us about the group"
                autoCapitalize="none"
                autoCorrect={false}
                // isCorrect={}
              />

              <Pressable
                testID="editGroupProfileButton"
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  (!vm.isGroupNameValid || vm.isEditing) &&
                    styles.buttonDisabled,
                ]}
                disabled={!vm.isGroupNameValid || vm.isEditing}
                onPress={() => vm.editProfile()}
              >
                {!vm.isEditing ? (
                  <Text style={styles.buttonText}>Edit Profile</Text>
                ) : (
                  <ActivityIndicator color={colors.onPrimary} size={"small"} />
                )}
              </Pressable>
              {vm.error && (
                <Text
                  style={{
                    color: colors.error,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  {vm.error}
                </Text>
              )}
            </View>
          </View>
          <UploadModal
            modalVisible={vm.isModalVisible}
            onBackPress={() => vm.setIsModalVisible(false)}
            onGalleryPress={() => uploadImage()}
            onRemovePress={() => removeImage()}
            onRequestClose={() => vm.setIsModalVisible(false)}
            isLoading={false}
          />
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
