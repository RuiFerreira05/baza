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
      animationType="fade"
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
            <Text style={styles.subTitle2}>Upload Image</Text>

            <View style={styles.row}>
              <TouchableOpacity
                onPress={onGalleryPress}
                style={styles.columnOptions}
              >
                <FontAwesome name="photo" size={30} color={colors.secondary} />
                <Text style={styles.text}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onRemovePress}
                style={styles.columnOptions}
              >
                <FontAwesome name="trash" size={30} color={colors.secondary} />
                <Text style={styles.text}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>
    </Modal>
  );
}
