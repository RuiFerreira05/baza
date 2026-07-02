import { useEditProfileStyles } from "@/constants/styles/useEditProfileStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontAwesome } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface UploadModalProps {
  modalVisible: boolean;
  onBackPress: () => void;
  onGalleryPress: () => void;
  onRemovePress: () => void;
  onRequestClose: () => void;
  isLoading: boolean;
}

export default function UploadModal({
  modalVisible,
  onBackPress,
  onGalleryPress,
  onRemovePress,
  onRequestClose,
  isLoading = false,
}: UploadModalProps) {
  const styles = useEditProfileStyles();
  const { colors } = useAppTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={onRequestClose}
    >
      <Pressable
        onPress={onBackPress}
        style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.4)" }]}
      >
        {isLoading && <ActivityIndicator size={70} color={colors.primary} />}
        {!isLoading && (
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text>Upload Image</Text>

            <View>
              <TouchableOpacity onPress={onGalleryPress}>
                <FontAwesome name="photo" size={30} color="black" />
                <Text>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onRemovePress}>
                <FontAwesome name="trash" size={30} color="black" />
                <Text>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>
    </Modal>
  );
}
