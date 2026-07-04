import { useFriendsStyles } from "@/constants/styles/useFriendsStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

interface RemoveFriendModalProps {
  friendName: string;
  modalVisible: boolean;
  onBackPress: () => void;
  onRemovePress: () => void;
  onCancelPress: () => void;
  onRequestClose: () => void;
  isLoading: boolean;
}

export default function RemoveFriendModal({
  friendName,
  modalVisible,
  onBackPress,
  onRemovePress,
  onCancelPress,
  onRequestClose,
  isLoading = false,
}: RemoveFriendModalProps) {
  const styles = useFriendsStyles();
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
            <Text style={styles.subTitle}>
              Remove {friendName} from friends?
            </Text>

            <View style={styles.row}>
              <Pressable
                onPress={onRemovePress}
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={{ color: colors.onPrimary }}>Remove</Text>
              </Pressable>

              <Pressable
                onPress={onCancelPress}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={{ color: colors.primary }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Pressable>
    </Modal>
  );
}
