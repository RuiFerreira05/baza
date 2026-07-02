import LabeledInput from "@/components/LabeledInput";
import UploadModal from "@/components/UploadModal";
import { useEditProfileStyles } from "@/constants/styles/useEditProfileStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthState } from "@/hooks/useAuthState";
import { useEditProfileViewModel } from "@/viewmodels/useEditProfileViewModel";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
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
  const styles = useEditProfileStyles();
  const router = useRouter();
  const { colors } = useAppTheme();

  const { profile, bypassAuth } = useAuthState();

  if (!profile && !bypassAuth) {
    router.push("../(onboarding)/createProfile");
  }
  const vm = useEditProfileViewModel(
    profile ?? {
      username: "Developer",
      photo: null,
      description: "Just a developer profile",
      userId: "fKagbUx7LwvE72kxf0PL7cdd7AjncKBT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  );

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [image, setImage] = useState(
    bypassAuth || !profile?.photo
      ? require("@/assets/images/profileImg.png")
      : profile?.photo,
  );

  const saveImage = async (image: string) => {
    try {
      setImage(image);
      setIsModalVisible(false);
    } catch (error) {
      throw error;
    }
  };

  const removeImage = async () => {
    try {
      setImage(require("@/assets/images/profileImg.png"));
      setIsModalVisible(false);
    } catch (error) {
      alert("Error removing image: " + (error as Error).message);
      setIsModalVisible(false);
    }
  };

  const uploadImage = async () => {
    try {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await saveImage(result.assets[0].uri);
      }
    } catch (error) {
      alert("Error uploading image: " + (error as Error).message);
      setIsModalVisible(false);
    }
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
          {/* <Text>Edit Profile Screen</Text> */}
          <View style={styles.column}>
            <View style={styles.profileView}>
              <Image
                style={styles.profileImage}
                source={typeof image === "number" ? image : { uri: image }}
              />
            </View>

            <View style={styles.iconContainer}>
              <FontAwesome.Button
                name="edit"
                size={23}
                iconStyle={styles.editicon}
                style={styles.editButton}
                borderRadius={100}
                onPress={() => setIsModalVisible(true)}
              />
            </View>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.form}>
              <LabeledInput
                label="Username"
                value={vm.usernameInput}
                onChangeText={vm.setUsernameInput}
                placeholder="e.g. john@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                isCorrect={vm.isUsernameValid}
                isEnabled={false}
              />

              <LabeledInput
                label="About me"
                value={vm.descriptionInput ?? ""}
                onChangeText={vm.setDescriptionInput}
                placeholder="Tell us about yourself"
                autoCapitalize="none"
                autoCorrect={false}
                // isCorrect={}
              />

              <Pressable
                testID="createProfileButton"
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  (!vm.isUsernameValid || vm.isEditing) &&
                    styles.buttonDisabled,
                ]}
                disabled={!vm.isUsernameValid || vm.isEditing}
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
            modalVisible={isModalVisible}
            onBackPress={() => setIsModalVisible(false)}
            onGalleryPress={() => uploadImage()}
            onRemovePress={() => removeImage()}
            onRequestClose={() => setIsModalVisible(false)}
            isLoading={false}
          />
        </KeyboardGestureArea>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
